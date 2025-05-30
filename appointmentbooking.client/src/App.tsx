import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./Pages/HomePage/HomePage";
import RegisterPage from "./Pages/AuthPages/RegisterPage";
import LoginPage from "./Pages/AuthPages/LoginPage";
import SearchResultsPage from "./Pages/SearchResultsPage/SearchResultsPage";
import RegisterServiceProviderPage from "./Pages/RegisterServiceProviderPage/RegisterServiceProviderPage";
import ServiceProviderPage from "./Pages/ServiceProviderPage/ServiceProviderPage";
import ServiceForm from "./Pages/ServicePages/ServiceForm";
import EditServicePage from "./Pages/ServicePages/EditServicePage";
import BookingPageWrapper from "./Pages/AppointmentBooking/AppointmentBookingWrapper";
import ProfilePage from "./Pages/ProfilePage/ProfilePage";
import Layout from "./Layouts/Layout";
import { AuthProvider } from "./Context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout searchBar={true} />}>
            <Route index path="/" element={<HomePage />} />
            <Route path="/search-results" element={<SearchResultsPage />} />
            <Route
              path="/service-provider/:id"
              element={<ServiceProviderPage />}
            />
          </Route>
          <Route element={<Layout searchBar={false} />}>
            <Route path="/signup" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route
              path="/register-service-provider"
              element={<RegisterServiceProviderPage />}
            />
            <Route
              path="/add-service/:serviceProviderId"
              element={<ServiceForm defaultValues={undefined} mode="create" />}
            />
            <Route
              path="/edit-service/:serviceProviderId/:serviceId"
              element={<EditServicePage />}
            />
            <Route
              path="/book-appointment/:serviceProviderId/:serviceId"
              element={<BookingPageWrapper />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
