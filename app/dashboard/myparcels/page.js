"use client";

export default function DeliveryActivities() {
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
          <div className="inline-flex h-11 flex-1 w-full gap-0.5 overflow-x-auto rounded-lg bg-gray-100 p-0.5 sm:w-auto lg:min-w-fit dark:bg-gray-900">
            {["All", "Delivered", "In-Transit", "Pending", "Processing"].map(
              (label, i) => (
                <button
                  key={i}
                  className={`h-10 flex-1 rounded-md px-2 py-2 text-xs font-medium sm:px-3 sm:text-sm lg:flex-initial ${
                    i === 0
                      ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button className="shadow-theme-xs flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 sm:w-auto sm:min-w-[100px] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              {/* Filter Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M14.6537 5.90414C14.6537 4.48433 13.5027 3.33331 12.0829 3.33331C10.6631 3.33331 9.51206 4.48433 9.51204 5.90415M14.6537 5.90414C14.6537 7.32398 13.5027 8.47498 12.0829 8.47498C10.663 8.47498 9.51204 7.32398 9.51204 5.90415M14.6537 5.90414L17.7087 5.90411M9.51204 5.90415L2.29199 5.90411M5.34694 14.0958C5.34694 12.676 6.49794 11.525 7.91777 11.525C9.33761 11.525 10.4886 12.676 10.4886 14.0958M5.34694 14.0958C5.34694 15.5156 6.49794 16.6666 7.91778 16.6666C9.33761 16.6666 10.4886 15.5156 10.4886 14.0958M5.34694 14.0958L2.29199 14.0958M10.4886 14.0958L17.7087 14.0958"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Filter
            </button>
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
                {["Category", "Company", "Arrival", "Route", "Price", "Status"].map(
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
            <tbody className="divide-x divide-y divide-gray-200 dark:divide-gray-800">
              {/* Example Row */}
              <tr className="transition hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="p-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center text-sm font-medium text-gray-700 select-none dark:text-gray-400">
                      <span className="relative">
                        <input type="checkbox" className="sr-only" />
                        <span className="flex h-4 w-4 items-center justify-center rounded-sm border-[1.25px] bg-transparent border-gray-300 dark:border-gray-700">
                          <span className="opacity-0">
                            <svg width="12" height="12" fill="none">
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
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-400">
                      #324112
                    </span>
                  </div>
                </td>

                <td className="p-4 text-sm whitespace-nowrap text-gray-800 dark:text-white/90">
                  Furniture
                </td>
                <td className="p-4 text-sm whitespace-nowrap text-gray-800 dark:text-white/90">
                  HomeLine
                </td>
                <td className="p-4 text-sm whitespace-nowrap text-gray-800 dark:text-white/90">
                  10 Apr 2028 2:15 pm
                </td>
                <td className="p-4 text-sm whitespace-nowrap text-gray-800 dark:text-white/90">
                  Berlin–Milan
                </td>
                <td className="p-4 text-sm whitespace-nowrap text-gray-800 dark:text-white/90">
                  $1,250.00
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span className="bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-500 text-xs rounded-full px-2 py-0.5 font-medium">
                    Delivered
                  </span>
                </td>
              </tr>

              {/* Add your more rows here */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
