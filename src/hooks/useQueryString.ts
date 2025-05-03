import { useSearchParams } from "react-router";
import { useEffect } from "react";

export const useQueryString = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamsObject = Object.fromEntries([...searchParams]);

  useEffect(() => {
    if (Object.keys(searchParamsObject).length === 0) {
      setSearchParams({ searchParams: "defaultValue" });
    }
  }, [searchParams, setSearchParams, searchParamsObject]);

  return searchParamsObject;
};
