import { useEffect, useRef, useState } from "react";

interface UseSelectDataProps<T> {
  service: () => Promise<T[] | { data: T[] }>; // Dịch vụ có thể trả về array hoặc object chứa 'data'
}

interface UseSelectDataResult<T> {
  data: T[]; // Luôn trả về mảng dữ liệu
  loading: boolean;
  error: string | null;
}

const useSelectOptionData = <T>({
  service,
}: UseSelectDataProps<T>): UseSelectDataResult<T> => {
  const [data, setData] = useState<T[]>([]); // Khởi tạo data là mảng trống
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const serviceRef = useRef(service);

  useEffect(() => {
    serviceRef.current = service; // cập nhật ref nếu service thay đổi
  }, [service]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await serviceRef.current();

        // Kiểm tra nếu result là object có property 'data'
        if ("data" in result) {
          setData(result.data); // Nếu có 'data', lấy data từ object
        } else {
          setData(result); // Nếu result là mảng trực tiếp, lưu vào data
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // chỉ chạy 1 lần khi mount

  return { data, loading, error };
};

export default useSelectOptionData;
