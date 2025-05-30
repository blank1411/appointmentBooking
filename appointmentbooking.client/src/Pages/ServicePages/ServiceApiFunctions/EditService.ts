import { CreateServiceDto } from "../ServiceForm";

export async function fetchService(
  mode: "edit" | "create",
  serviceProviderId: string,
  serviceData: CreateServiceDto,
  token: string,
  serviceId?: string
): Promise<Response> {
  const {} = serviceData;

  const url =
    mode === "edit"
      ? `/api/serviceproviders/${serviceProviderId}/services/${serviceId}`
      : `/api/serviceproviders/${serviceProviderId}/services`;

  const method = mode === "edit" ? "PUT" : "POST";

  return await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(serviceData),
  });
}
