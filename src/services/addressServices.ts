import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export interface Address {
  id: number;
  province: string;
  district: string;
  ward: string;
  street: string;
  latitude: number | null;
  longitude: number | null;
  create_at: string;
  update_at: string;
  deleted_at: string | null;
}

export interface AddressQueryParams {
  page?: number;
  limit?: number;
  sort_by?:
    | "province"
    | "district"
    | "ward"
    | "street"
    | "create_at"
    | "update_at";
  sort_order?: "asc" | "desc";
  search?: string;
}

export interface CreateAddressRequest {
  province: string;
  district: string;
  ward: string;
  street: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UpdateAddressRequest extends CreateAddressRequest {
  id: number;
}

// Add new types for location data
export interface Province {
  id: string;
  name: string;
  type: number;
  typeText: string;
  slug: string;
}

export interface LocationResponse {
  total: number;
  data: Province[];
  code: string;
  message: string | null;
}

export interface LocationQueryParams {
  page?: number;
  size?: number;
  query?: string;
}

// Update location types
export interface Location {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  province_code?: number;
  districts?: Location[];
  wards?: Location[];
}

export const addressApi = createApi({
  reducerPath: "addressApi",
  baseQuery: baseQueryWithReauth(),
  tagTypes: ["Address"],
  endpoints: (builder) => ({
    // GET /addresses
    getAddresses: builder.query<
      {
        data: Address[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      },
      AddressQueryParams
    >({
      query: (params) => ({
        url: "/address",
        method: "GET",
        params,
      }),
      providesTags: ["Address"],
    }),

    // GET /address/:id
    getAddressById: builder.query<Address, number>({
      query: (id) => ({
        url: `/address/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Address", id }],
    }),

    // POST /addresses
    createAddress: builder.mutation<Address, CreateAddressRequest>({
      query: (data) => ({
        url: "/address",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Address"],
    }),

    // PUT /address/:id
    updateAddress: builder.mutation<Address, UpdateAddressRequest>({
      query: ({ id, ...data }) => ({
        url: `/address/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Address", id },
        "Address",
      ],
    }),

    // DELETE /address/:id
    deleteAddress: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/address/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Address"],
    }),

    // GET /address/provinces - Get all provinces
    getProvinces: builder.query<Location[], void>({
      query: () => ({
        url: "/address/provinces",
        method: "GET",
      }),
    }),

    // GET /address/provinces/:code/districts - Get districts of a province
    getDistricts: builder.query<Location[], number>({
      query: (provinceCode) => ({
        url: `/address/provinces/${provinceCode}/districts`,
        method: "GET",
      }),
    }),

    // GET /address/districts/:code/wards - Get wards of a district
    getWards: builder.query<Location[], number>({
      query: (districtCode) => ({
        url: `/address/districts/${districtCode}/wards`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useGetAddressByIdQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useGetProvincesQuery,
  useGetDistrictsQuery,
  useGetWardsQuery,
} = addressApi;
