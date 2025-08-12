import "./App.css";
import {Route, Routes,useNavigate} from "react-router-dom";
import Home from "./pages/Home"
import Navbar from "./components/common/Navbar"
import OpenRoute from "./components/core/Auth/OpenRoute"

import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import VerifyEmail from "./pages/VerifyEmail";
import About from "./pages/About";
import EditCourse from "./components/core/Dashboard/EditCourse";
import MyCourses from "./components/core/Dashboard/MyCourses";
import MyProfile from "./components/core/Dashboard/MyProfile";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/core/Auth/PrivateRoute";
import Error from "./pages/Error"
import { useDispatch, useSelector } from "react-redux";
import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses";
import Settings from "./components/core/Dashboard/Settings/"
import Cart from "./components/core/Dashboard/Cart"
import { ACCOUNT_TYPE } from "./utils/constants";
import AddCourse from "./components/core/Dashboard/AddCourse";
import Contact from "./pages/Contact";
import ViewCourse from "./pages/ViewCourse"
import CourseDetails from "./pages/CourseDetails";
import Catalog from "./pages/Catalog";
import Instructor from "./components/core/Dashboard/Instructor";
import VideoDetailsSidebar from "./components/core/ViewCourse/VideoDetailsSidebar";
import { getUserDetails } from "./services/operations/profileAPI"
import { useEffect } from "react";
import EditProfile from "./components/core/Dashboard/Settings/EditProfile";



function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.profile);
  
  
 useEffect(() => {
  const token = localStorage.getItem("token"); // ✅ no JSON.parse
  if (token) {
    dispatch(getUserDetails(token, navigate));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  return (
   <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
    <Navbar/>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/about" element={<About/>}/>
      <Route path="/contact" element={<Contact/>}/>
      <Route path="/courses/:courseId" element={<CourseDetails/>}/>
      <Route path="/catalog/:catalogName" element={<Catalog/>}/>


      
    <Route
          path="login"
          element={
            <OpenRoute>
              <Login />
            </OpenRoute>
          }
        />
        <Route
          path="forgot-password"
          element={
            <OpenRoute>
              <ForgotPassword />
            </OpenRoute>
          }
        />
        <Route
          path="update-password/:id"
          element={
            <OpenRoute>
              <UpdatePassword/>
            </OpenRoute>
          }
        />
        <Route
          path="signup"
          element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />
        <Route
          path="verify-email"
          element={
            <OpenRoute>
              <VerifyEmail/>
            </OpenRoute>
          }
        />
        
        <Route 
        
        element={
          <PrivateRoute>
            <Dashboard/>
          </PrivateRoute>
        }> 
        {/* Route for all users */}
        <Route path="dashboard/my-profile" element={<MyProfile/>}/>
        <Route path="dashboard/Settings" element={<Settings/>}/>
        {/* Route only for Instructors */}
          {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
            <>
              <Route path="dashboard/instructor" element={<Instructor />} />
              <Route path="dashboard/my-courses" element={<MyCourses/>} />
              <Route path="dashboard/add-course" element={<AddCourse />} />
              <Route
                path="dashboard/edit-course/:courseId"
                element={<EditCourse />}
              />
            </>
          )}
        {

           /* Route only for Students */
        user?.accountType === ACCOUNT_TYPE.STUDENT && (
          <>
          
          <Route path="dashboard/enrolled-courses" element={<EnrolledCourses />} />
          <Route path="dashboard/cart" element={<Cart />} />
          </>
        )
      }
      <Route path="dashboard/settings" element={<Settings />} />
        </Route>

      
        {/* For the watching course lectures */}
        <Route
          element={
            <PrivateRoute>
              <ViewCourse />
            </PrivateRoute>
          }
        >
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route
                path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
                element={<VideoDetailsSidebar />}
              />
            </>
          )}
        </Route>

        
        
        <Route path="*" element={<Error/>} />
    </Routes>
    

   </div>
  );
}

export default App;
