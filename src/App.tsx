import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import SubjectPage from "./pages/Admin/Subject/View";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import ExamPage from "./pages/Admin/Exam/View";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DetailExam from "./pages/Admin/Exam/DetailExam";
import { useDispatch } from "react-redux";
import { useGetCurrentUserQuery } from "./stores/auth/authApi";
import { setUser } from "./stores/auth/authSlice";
import { PrivateRoute } from "./routes/protectedRoute";
import { PublicRoute } from "./routes/publicRoute";
import Cookies from "js-cookie";
import UploadExcel from "./pages/Admin/Exam/UploadExcel";

const queryClient = new QueryClient();

export default function App() {
  const dispatch = useDispatch();
  const accessToken = Cookies.get("access_token");
  const { data, isLoading } = useGetCurrentUserQuery(undefined, {
    skip: !accessToken,
  });

  useEffect(() => {
    if (data && !isLoading) {
      dispatch(setUser(data));
    }
  }, [data, isLoading, dispatch]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Auth Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>
          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            {/* Dashboard Layout */}
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />

              {/* Trang khác */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/blank" element={<Blank />} />

              {/* Forms */}
              <Route path="/form-elements" element={<FormElements />} />

              {/* Tables */}
              <Route path="/basic-tables" element={<BasicTables />} />

              {/* Ui Elements */}
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/subject" element={<SubjectPage />} />
              <Route path="/exam" element={<ExamPage />} />
              <Route path="/exam/detail" element={<DetailExam />} />
              <Route path="/upload-file" element={<UploadExcel />} />

              {/* Charts */}
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </Route>
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster position="top-right" containerStyle={{ zIndex: "9999" }} />
    </QueryClientProvider>
  );
}
