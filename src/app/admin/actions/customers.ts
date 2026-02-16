'use server';

/**
 * Customer Server Actions
 *
 * Primary API for customer operations from the frontend.
 * Each action validates input with Zod, calls the service layer, and returns ActionResult.
 */

import { revalidatePath } from 'next/cache';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { CustomerService } from '@/lib/services/customer.service';
import {
  createCustomerSchema,
  UpdateCustomerInput,
  updateCustomerSchema,
  type CreateCustomerInput,
} from '@/lib/validations/customer';
import {
  isAppError,
  getErrorMessage,
  DuplicatePhoneError,
  UnauthorizedError,
  ForbiddenError,
} from '@/lib/utils/errors';
import type { Customer } from '@/lib/types/database';
import type { ActionResult } from '@/lib/types/api';
import { CustomerListResult, CustomerSummary, CustomerWithDetails } from '@/lib/types/customer';

// ============================================================================
// Types
// ============================================================================

interface DuplicateCustomerResult {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

// ============================================================================
// Helper: Get Current Admin
// ============================================================================

/**
 * Gets the current authenticated admin user.
 * Throws if not authenticated or not an admin.
 */
async function getCurrentAdmin(): Promise<{ id: string; email: string; fullName: string }> {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new UnauthorizedError('You must be logged in to perform this action');
  }

  // Verify user is an admin
  const { data: admin, error: adminError } = await supabase
    .from('admins')
    .select('id, email, full_name')
    .eq('id', user.id)
    .single();

  if (adminError || !admin) {
    throw new ForbiddenError('You must be an admin to perform this action');
  }

  return {
    id: admin.id,
    email: admin.email,
    fullName: admin.full_name,
  };
}



// ============================================================================
// Create Customer (Allow Duplicate) Action
// ============================================================================

/**
 * Creates a customer even if a duplicate phone exists.
 * Used when user confirms they want to create despite the warning.
 */
export async function createCustomerAllowDuplicate(
  input: CreateCustomerInput
): Promise<ActionResult<Customer>> {
  try {
    // Validate input
    const validationResult = createCustomerSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0]?.message ?? 'Validation failed',
        code: 'VALIDATION_ERROR',
      };
    }

    const data = validationResult.data;

    // Get current admin
    const admin = await getCurrentAdmin();

    // Create Supabase client and service
    const supabase = await createClient();
    const customerService = new CustomerService(supabase);

    // Create customer without duplicate check
    const customer = await customerService.createAllowDuplicate(
      {
        phone: data.phone,
        name: data.name,
        email: data.email,
        source: data.source,
      },
      admin.id
    );

    // Revalidate customers list
    revalidatePath('/admin/customers');

    return {
      success: true,
      data: customer,
    };
  } catch (error) {
    console.error('Error in createCustomerAllowDuplicate:', error);

    if (isAppError(error)) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }

    return {
      success: false,
      error: getErrorMessage(error),
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// Check Duplicate Phone Action
// ============================================================================

/**
 * Checks if a phone number already exists in the system.
 *
 * - Normalizes phone number
 * - Searches for existing customer
 * - Returns customer data if found, null if not
 */
export async function checkDuplicatePhone(
  phone: string
): Promise<ActionResult<DuplicateCustomerResult | null>> {
  try {
    if (!phone || phone.length < 10) {
      return {
        success: true,
        data: null,
      };
    }

    // Get current admin (ensures user is authenticated)
    await getCurrentAdmin();

    // Create Supabase client and service
    const supabase = await createClient();
    const customerService = new CustomerService(supabase);

    // Check for duplicate
    const existingCustomer = await customerService.checkDuplicatePhone(phone);

    return {
      success: true,
      data: existingCustomer,
    };
  } catch (error) {
    console.error('Error in checkDuplicatePhone:', error);

    // For auth errors, return null (don't expose to user)
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return {
        success: true,
        data: null,
      };
    }

    return {
      success: false,
      error: getErrorMessage(error),
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// Get Customer by ID
// ============================================================================

/**
 * Fetches a customer by ID with all related entities.
 *
 * Returns full customer details including:
 * - Tags
 * - Properties with pools
 * - Recent communications
 * - Estimates
 * - Notes
 *
 * @param id - Customer UUID
 * @returns Customer with details or error
 */
export async function getCustomer(
  id: string
): Promise<ActionResult<CustomerWithDetails>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to view customer details',
        code: 'UNAUTHORIZED',
      };
    }

    const adminClient = createAdminClient();
    const service = new CustomerService(adminClient);
    const customer = await service.getById(id);

    if (!customer) {
      return {
        success: false,
        error: 'Customer not found',
        code: 'NOT_FOUND',
      };
    }

    return {
      success: true,
      data: customer,
    };
  } catch (error) {
    console.error('Error fetching customer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch customer',
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// Update Customer Action
// ============================================================================

// ============================================================================
// Create Customer
// ============================================================================

/**
 * Creates a new customer.
 *
 * - Validates input with Zod
 * - Normalizes phone number to E.164 format
 * - Creates customer in database
 * - Returns created customer or error
 */
export async function createCustomer(
  input: CreateCustomerInput
): Promise<ActionResult<Customer>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to create customers',
        code: 'UNAUTHORIZED',
      };
    }

    // Validate input
    const validationResult = createCustomerSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0]?.message ?? 'Validation failed',
        code: 'VALIDATION_ERROR',
      };
    }

    const data = validationResult.data;

    const adminClient = createAdminClient();
    const service = new CustomerService(adminClient);

    const customer = await service.create(
      {
        phone: data.phone,
        name: data.name,
        email: data.email || null,
        source: data.source || null,
      },
      adminId
    );

    // Revalidate customers list
    revalidatePath('/admin/customers');

    return {
      success: true,
      data: customer,
    };
  } catch (error) {
    console.error('Error creating customer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create customer',
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// Delete Customer Action
// ============================================================================

/**
 * Soft deletes a customer.
 */
/**
 * Soft deletes a customer.
 *
 * Sets deleted_at timestamp rather than removing the record.
 *
 * @param id - Customer UUID
 * @returns Success indicator or error
 */
export async function deleteCustomer(
  id: string
): Promise<ActionResult<{ deleted: boolean }>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to delete customers',
        code: 'UNAUTHORIZED',
      };
    }

    const adminClient = createAdminClient();
    const service = new CustomerService(adminClient);

    const deleted = await service.delete(id);

    if (!deleted) {
      return {
        success: false,
        error: 'Customer not found',
        code: 'NOT_FOUND',
      };
    }

    // Revalidate customers list
    revalidatePath('/admin/customers');

    return {
      success: true,
      data: { deleted: true },
    };
  } catch (error) {
    console.error('Error deleting customer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete customer',
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// Search Customers Action
// ============================================================================

/**
 * Searches customers by phone or name.
 */
export async function searchCustomers(
  query: string,
  limit: number = 10
): Promise<ActionResult<Array<{
  id: string;
  name: string;
  phone: string;
  phone_normalized: string;
  email: string | null;
  source: string | null;
  created_at: string;
}>>> {
  try {
    // Get current admin
    await getCurrentAdmin();

    // Create Supabase client and service
    const supabase = await createClient();
    const customerService = new CustomerService(supabase);

    const customers = await customerService.search(query, limit);

    return {
      success: true,
      data: customers,
    };
  } catch (error) {
    console.error('Error in searchCustomers:', error);

    if (isAppError(error)) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }

    return {
      success: false,
      error: getErrorMessage(error),
      code: 'INTERNAL_ERROR',
    };
  }
}


/**
 * Updates an existing customer.
 *
 * - Validates input with Zod
 * - Re-normalizes phone number if changed
 * - Updates customer in database
 * - Returns updated customer or error
 *
 * @param id - Customer UUID
 * @param input - Partial customer data to update
 * @returns Updated customer or error
 */
export async function updateCustomer(
  id: string,
  input: UpdateCustomerInput
): Promise<ActionResult<Customer>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to update customers',
        code: 'UNAUTHORIZED',
      };
    }

    // Validate input
    const validationResult = updateCustomerSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0]?.message ?? 'Validation failed',
        code: 'VALIDATION_ERROR',
      };
    }

    const data = validationResult.data;

    const adminClient = createAdminClient();
    const service = new CustomerService(adminClient);

    // Check if customer exists
    const existingCustomer = await service.getById(id);
    if (!existingCustomer) {
      return {
        success: false,
        error: 'Customer not found',
        code: 'NOT_FOUND',
      };
    }

    console.log("ID: ", id)

    const customer = await service.update(id, {
      phone: data.phone,
      name: data.name,
      email: data.email ?? null,
      source: data.source ?? null,
    });

    // Revalidate customer pages
    revalidatePath('/admin/customers');
    revalidatePath(`/admin/customers/${id}`);

    return {
      success: true,
      data: customer,
    };
  } catch (error) {
    console.error('Error updating customer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update customer',
      code: 'INTERNAL_ERROR',
    };
  }
}


// ============================================================================
// List Customers Action
// ============================================================================

export interface ListCustomersParams {
  limit?: number;
  offset?: number;
  search?: string;
  sortBy?: 'name' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}

export interface ListCustomersResult {
  customers: Customer[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Lists customers with pagination and optional search.
 *
 * @param params - List parameters
 * @returns Paginated customer list or error
 */
export async function listCustomers(
  params: ListCustomersParams = {}
): Promise<ActionResult<CustomerListResult>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to view customers',
        code: 'UNAUTHORIZED',
      };
    }

    const adminClient = createAdminClient();
    const service = new CustomerService(adminClient);

    const result = await service.list({
      limit: params.limit ?? 25,
      offset: params.offset ?? 0,
      search: params.search,
      sortBy: params.sortBy ?? 'created_at',
      sortOrder: params.sortOrder ?? 'desc',
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error listing customers:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list customers',
      code: 'INTERNAL_ERROR',
    };
  }
}

// ============================================================================
// Global Search Action
// ============================================================================

/**
 * Global search for customers by phone or name.
 *
 * Optimized for header search dropdown.
 *
 * @param query - Search query
 * @param limit - Maximum results (default 10)
 * @returns Matching customers or error
 */
export async function globalSearchCustomers(
  query: string,
  limit: number = 10
): Promise<ActionResult<CustomerSummary[]>> {
  try {
    const adminId = await getAuthenticatedAdminId();
    if (!adminId) {
      return {
        success: false,
        error: 'You must be logged in to search customers',
        code: 'UNAUTHORIZED',
      };
    }

    const adminClient = createAdminClient();
    const service = new CustomerService(adminClient);

    const customers = await service.globalSearch(query, limit);

    return {
      success: true,
      data: customers,
    };
  } catch (error) {
    console.error('Error searching customers:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search customers',
      code: 'INTERNAL_ERROR',
    };
  }
}


// ============================================================================
// Get Customer Count Action
// ============================================================================

/**
 * Gets the total number of customers.
 */
export async function getCustomerCount(): Promise<ActionResult<number>> {
  try {
    // Get current admin
    await getCurrentAdmin();

    // Create Supabase client and service
    const supabase = await createClient();
    const customerService = new CustomerService(supabase);

    const count = await customerService.getCount();

    return {
      success: true,
      data: count,
    };
  } catch (error) {
    console.error('Error in getCustomerCount:', error);

    if (isAppError(error)) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }

    return {
      success: false,
      error: getErrorMessage(error),
      code: 'INTERNAL_ERROR',
    };
  }
}

async function getAuthenticatedAdminId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Verify user is an admin
  const adminClient = createAdminClient();
  const { data: admin } = await adminClient
    .from('admins')
    .select('id')
    .eq('id', user.id)
    .single();

  return admin?.id ?? null;
}
