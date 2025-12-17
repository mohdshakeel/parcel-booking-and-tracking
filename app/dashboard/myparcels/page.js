"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal,Search, X} from "lucide-react";


  
export default function DeliveryActivities() {
const [data, setData] = useState([]);
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openSearch, setOpenSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");


  useEffect(() => {
    fetch(
      `/api/parcels?status=${status}&search=${search}&page=${page}&limit=5`
    )
      .then(res => res.json())
      .then(res => {
        setData(res.data);
        setTotalPages(res.totalPages);
      });
  }, [status, search, page]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-gray-200 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between dark:border-gray-800">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Delivery Activities
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track your recent shipping activities
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row lg:items-center">
          {/* Status Filters */}
          {["All", "Delivered", "In-Transit", "Pending", "Processing"].map(label => (
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
          placeholder="Search order ID, company, route..."
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
                {/* Order ID Head */}
                <th className="p-4">
                  <div className="flex w-full items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div>
                        <label className="flex cursor-pointer items-center text-sm font-medium text-gray-700 select-none dark:text-gray-400">
                          <span className="relative">
                            <input type="checkbox" className="sr-only" />
                            <span className="flex h-4 w-4 items-center justify-center rounded-sm border-[1.25px] bg-transparent border-gray-300 dark:border-gray-700">
                              <span className="opacity-0">
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 12 12"
                                  fill="none"
                                >
                                  <path
                                    d="M10 3L4.5 8.5L2 6"
                                    stroke="white"
                                    strokeWidth="1.6666"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </span>
                          </span>
                        </label>
                      </div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Order ID
                      </p>
                    </div>
                  </div>
                </th>

                {/* Other table heads */}
                {["Sender", "Receiver", "Parcel Type", "Weight/size", "Price", "Status"].map(
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
  {data.map(parcel => (
    <tr key={parcel._id} className="hover:bg-gray-50">
      <td className="p-4 text-xs">#{parcel.trackingId}</td>
      <td className="p-4 text-xs">{parcel.senderName}-{parcel.senderAddress}</td>
      <td className="p-4 text-xs">{parcel.receiverName}-{parcel.receiverAddress}</td>
      <td className="p-4 text-xs" > {parcel.parcelType} Booked at {new Date(parcel.createdAt).toLocaleString()}
      </td>
      <td className="p-4 text-xs">{parcel.weight}/{parcel.weight}</td>
      <td className="p-4 text-xs">${parcel.price}</td>
      <td className="p-4 text-xs">
        <span className="text-xs font-medium">
          {parcel.status}
        </span>
      </td>
    </tr>
  ))}
</tbody>

          </table>
          <div className="flex justify-end gap-2 p-4">
  <button
    disabled={page === 1}
    onClick={() => setPage(p => p - 1)}
  >
    Prev
  </button>

  <span>{page} / {totalPages}</span>

  <button
    disabled={page === totalPages}
    onClick={() => setPage(p => p + 1)}
  >
    Next
  </button>
</div>

        </div>
      </div>
    </div>
  );
}

