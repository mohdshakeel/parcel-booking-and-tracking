"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal,Search, X,User} from "lucide-react";
import AddUserModal from "./AddUserModal";
//import User from "@/models/User";



  
export default function UserActivities() {
const [data, setData] = useState([]);
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openSearch, setOpenSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [openUserModal, setOpenUserModal] = useState(false);


  useEffect(() => {
    fetch(
      `/api/users?status=${status}&search=${search}&page=${page}&limit=10`
    )
      .then(res => res.json())
      .then(res => {
       setData(res.users ?? []);      // ✅ fallback to empty array
  setTotalPages(res.totalPages ?? 1);
      });
  }, [status, search, page]);

  

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-gray-200 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between dark:border-gray-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            <div className="flex"><button
          onClick={() => setOpenUserModal(true)}
          className="flex px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        ><User size="20" color="white" className="mt-1 mr-1"></User>
           Add New User
        </button></div>
          </h3>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
           Know your customers status and details at a glance.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row lg:items-center">
          {/* Status Filters */}
          {["All", "Verified", "Active"].map(label => (
  <button
    key={label}
    onClick={() => {
      setStatus(label);
      setPage(1);
    }}
    className={`h-10 rounded-md px-3 text-sm ${
      status === label
        ? "bg-white shadow text-gray-900"
        : "text-gray-500"
    }`}
  >
    {label}
  </button>
))}

          {/* Filter Button */}
          <div className="relative">
            <button
  onClick={() => setOpenSearch(v => !v)}
  className="shadow-theme-xs flex h-11 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
>
  <SlidersHorizontal className="h-4 w-4" />
  Filter
</button>
{/* Search Dropdown */}
<div
  className={`absolute left-0 right-0 top-full z-50 mt-2 transform transition-all duration-300 ease-out ${
    openSearch
      ? "translate-y-0 opacity-100 pointer-events-auto"
      : "-translate-y-3 opacity-0 pointer-events-none"
  }`}
>
  <div className="absolute right-0 border border-gray-200 bg-gray-50 px-4 py-4 shadow-lg rounded-lg dark:border-gray-800 dark:bg-gray-900">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

      {/* Input */}
      <div className="relative w-[250px] flex-shrink-0">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          autoFocus={openSearch}
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search User ID, name, email, phone number..."
          className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-gray-900 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setSearch(searchValue);
            setOpenSearch(false);
          }}
          className="h-11 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
        >
          Apply
        </button>

        <button
          onClick={() => {
            setSearchValue("");
            setSearch("");
            setOpenSearch(false);
          }}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

    </div>
  </div>
</div>


          </div>
          

        </div>
      </div>

      {/* Table */}
      <div>
        <div className="custom-scrollbar overflow-x-auto">
          <table className="min-w-full w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                

                {/* Other table heads */}
                {["Name", "Email", "Phone", "Address", "City & Zip Code", "State & Country","Email Verification","Status"].map(
                  (head, i) => (
                    <th
                      key={i}
                      className="p-4 text-left text-xs font-medium cursor-pointer text-gray-500 dark:text-gray-400"
                    >
                      {head}
                    </th>
                  )
                )}
              </tr>
              
            </thead>

            {/* Table Body */}
            <tbody>
  {data.map((users) => {
    const address =
      typeof users.address === "object"
        ? users.address
        : {
            street: users.address || "",
            city: users.city || "",
            state: users.state_region || "",
            zipcode: users.zipCode || "",
            country: users.country || "",
          };

    return (
      <tr key={users._id} className="hover:bg-gray-50">
       

        <td className="p-4 text-xs">{users.name}</td>
        <td className="p-4 text-xs">{users.email}</td>
        <td className="p-4 text-xs">{users.phone}</td>

        <td className="p-4 text-xs">
          {address.street || "-"}
        </td>

        <td className="p-4 text-xs">
          {address.city}-{address.zipcode}
        </td>

        <td className="p-4 text-xs">
          {address.state} {address.country}
        </td>

        
        <td className="p-4 text-xs">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              users.emailVerified
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {users.emailVerified ? "Yes" : "No"}
          </span>
        </td>

        <td className="p-4 text-xs">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              users.isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {users.isActive ? "Active" : "Inactive"}
          </span>
        </td>
      </tr>
    );
  })}
</tbody>


          </table>
          <div className="flex justify-end gap-2 p-4">
  <button className="text-xs" 
    disabled={page === 1}
    onClick={() => setPage(p => p - 1)}
  >
    Prev
  </button>

  <span className="text-xs">{page} / {totalPages}</span>

  <button className="text-xs" 
    disabled={page === totalPages}
    onClick={() => setPage(p => p + 1)}
  >
    Next
  </button>
</div>

        </div>
      </div>
{/* Modal */}
      {openUserModal && <AddUserModal onClose={() => setOpenUserModal(false)} />}

    </div>

    
  );
}

