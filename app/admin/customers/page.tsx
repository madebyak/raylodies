import { getCustomers, getCustomerStats } from "@/actions/customers";
import { formatPrice } from "@/lib/utils";
import { Users, UserPlus, ShoppingBag } from "lucide-react";
import Image from "next/image";

export default async function CustomersPage() {
  const [customers, stats] = await Promise.all([
    getCustomers(),
    getCustomerStats()
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light text-white">Customers</h1>
        <p className="text-sm text-white/40 mt-1">
          View and manage your customer base
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-white/40">Total Customers</p>
              <p className="text-2xl font-light text-white">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <UserPlus className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-white/40">New This Month</p>
              <p className="text-2xl font-light text-white">{stats.newCustomersThisMonth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4">
                  Customer
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4">
                  Email
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4">
                  Orders
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4">
                  Total Spent
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4">
                  Role
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider px-6 py-4">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No customers yet</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/5">
                          {customer.avatar_url && customer.avatar_url !== '/images/default-avatar.png' ? (
                            <Image
                              src={customer.avatar_url}
                              alt={customer.full_name || customer.email}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/40 text-sm font-medium">
                              {(customer.full_name || customer.email).charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-white">
                            {customer.full_name || 'No name'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white/60">{customer.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="w-4 h-4 text-white/40" />
                        <span className="text-sm text-white">{customer.total_orders || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">
                        {formatPrice(customer.total_spent || 0)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        customer.role === 'super_admin' 
                          ? 'bg-purple-500/10 text-purple-400'
                          : 'bg-white/5 text-white/60'
                      }`}>
                        {customer.role === 'super_admin' ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white/60">
                        {new Date(customer.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}




