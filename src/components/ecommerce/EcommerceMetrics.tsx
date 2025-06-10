import { ArrowUpIcon, BoxIconLine, GroupIcon } from "../../icons";
import Badge from "../ui/badge/Badge";
import {
  useGetAllUserByMonthQuery,
  useGetAllUserStatisticalQuery,
} from "../../services/statisticalServices";

export default function EcommerceMetrics() {
  const { data: userByMonth, isLoading: isLoadingUserByMonth } =
    useGetAllUserByMonthQuery();
  const { data: allUserStatistical, isLoading: isLoadingAllUser } =
    useGetAllUserStatisticalQuery();

  if (isLoadingUserByMonth || isLoadingAllUser) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-xl"></div>
          <div className="mt-5">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="mt-2 h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-xl"></div>
          <div className="mt-5">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="mt-2 h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Tổng số lượng người dùng
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {allUserStatistical?.total}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Người dùng mới
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {userByMonth?.currentMonthTotal}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            {userByMonth?.percentageChange}%
          </Badge>
        </div>
      </div>
    </div>
  );
}
