import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import DetailExam from "./pages/Admin/Exam/DetailExam";
import UploadExcel from "./pages/Admin/Exam/UploadExcel";
import ExamPage from "./pages/Admin/Exam/View";
import SubjectPage from "./pages/Admin/Subject/View";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import Blank from "./pages/Blank";
import BarChart from "./pages/Charts/BarChart";
import LineChart from "./pages/Charts/LineChart";
import Home from "./pages/Dashboard/Home";
import FormElements from "./pages/Forms/FormElements";
import NotFound from "./pages/OtherPage/NotFound";
import BasicTables from "./pages/Tables/BasicTables";
import Alerts from "./pages/UiElements/Alerts";
import Avatars from "./pages/UiElements/Avatars";
import Badges from "./pages/UiElements/Badges";
import Buttons from "./pages/UiElements/Buttons";
import Images from "./pages/UiElements/Images";
import Videos from "./pages/UiElements/Videos";
import UserProfiles from "./pages/UserProfiles";
import BlogPage from "./pages/Admin/Blog/View";
import ProtectedRoute from "./routes/protectedRoute";
import { useFetchUserQuery } from "./stores/auth/authApi";
import { setUser } from "./stores/auth/authSlice";
import BlogDetail from "./pages/Admin/Blog/Detail";
import MenuView from "./pages/Admin/Menu/View";
import MenuDetail from "./pages/Admin/Menu/Detail";
import CourseView from "./pages/Admin/Course/View";
import CourseDetail from "./pages/Admin/Course/Detail";
import TeacherView from "./pages/Admin/Teacher/View";
import TeacherDetail from "./pages/Admin/Teacher/Detail";
import StaffView from "./pages/Admin/Staff/View";
import StaffDetail from "./pages/Admin/Staff/Action";
import AddressList from "./pages/Admin/Address/View";
import AddressAction from "./pages/Admin/Address/Action";
import WeekdayView from "./pages/Admin/Weekday/View";
import ClassView from "./pages/Admin/Classroom/View";
import ClassDetail from "./pages/Admin/Classroom/Detail";
import Calendar from "./pages/Calendar";
import StudentClass from "./pages/Admin/Classroom/StudentClass";

const queryClient = new QueryClient();

export default function App() {
  const dispatch = useDispatch();
  const { data: user, isLoading } = useFetchUserQuery();

  // Sync user vào Redux
  useEffect(() => {
    if (user) {
      console.log("user", user);

      dispatch(setUser(user));
    } else if (!isLoading) {
      dispatch(setUser(null));
    }
  }, [user, isLoading, dispatch]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Auth Routes */}
          <Route
            path="/signin"
            element={
              <ProtectedRoute isPublic>
                <SignIn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <ProtectedRoute isPublic>
                <SignUp />
              </ProtectedRoute>
            }
          />
          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
            {/* Dashboard Layout */}
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

            {/* Handle Exam */}
            <Route path="/exam" element={<ExamPage />} />
            <Route path="/exam/detail" element={<DetailExam />} />
            <Route path="/upload-file" element={<UploadExcel />} />
            <Route path="/timetable" element={<Calendar />} />
            {/* Handle Menu */}
            <Route path="/menu" element={<MenuView />} />
            <Route path="/menu/detail/:id?" element={<MenuDetail />} />

            {/* Handle Blog */}
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/detail/:id?" element={<BlogDetail />} />

            {/* Handle Course */}
            <Route path="/course" element={<CourseView />} />
            <Route path="/course/detail/:id?" element={<CourseDetail />} />

            {/* Handle Course */}
            <Route path="/teacher" element={<TeacherView />} />
            <Route path="/teacher/detail/:id?" element={<TeacherDetail />} />
            {/* Handle Staff */}
            <Route path="/staff" element={<StaffView />} />
            <Route path="/staff/detail/:id?" element={<StaffDetail />} />

            {/* Handle Staff */}
            <Route path="/address" element={<AddressList />} />
            <Route path="/address/detail/:id?" element={<AddressAction />} />

            {/* Handle Classroom */}
            <Route path="/classroom" element={<ClassView />} />
            <Route path="/classroom/detail/:id?" element={<ClassDetail />} />
            <Route
              path="/classroom/detail/:id/students"
              element={<StudentClass />}
            />

            {/* Handle Weekday */}
            <Route path="/schedule" element={<WeekdayView />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster position="top-right" containerStyle={{ zIndex: "9999" }} />
    </QueryClientProvider>
  );
}
