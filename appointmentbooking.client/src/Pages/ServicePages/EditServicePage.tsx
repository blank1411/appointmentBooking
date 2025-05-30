import { useLocation } from "react-router-dom";
import { Service } from "../../types/Service";
import ServiceForm from "./ServiceForm";

const EditServicePage = () => {
  const location = useLocation();
  const service: Service = location.state?.service;

  return (
    <div>
      <ServiceForm defaultValues={service} mode="edit" />
    </div>
  );
};

export default EditServicePage;
