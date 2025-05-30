export async function deleteService(
  serviceProviderId: number,
  serviceId: number,
  token: string
): Promise<void> {
  const response = await fetch(
    `/api/serviceproviders/${serviceProviderId}/services/${serviceId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to delete service");
  }
}
