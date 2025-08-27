import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboards from "./pages/Dashboards";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "@/components/Navbar";
import Footer from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AddDentist from "./components/AddDentist";
import MakePayments from "./components/MakePayments";
import AvailableDentists from "./pages/AvailableDentists";

import DentistDetails from "./pages/DentistDetails";
import Appointment from "./pages/Appointment";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboards /></ProtectedRoute>} />
          <Route path="/dashboard/admin" element={<ProtectedRoute><Dashboards /></ProtectedRoute>} />
          <Route path="/dashboard/dentist" element={<ProtectedRoute><Dashboards /></ProtectedRoute>} />
          <Route path="/dashboard/patient" element={<ProtectedRoute><Dashboards /></ProtectedRoute>} />
          <Route path="/addDentist" element={<ProtectedRoute><AddDentist /></ProtectedRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/pay" element={<ProtectedRoute><MakePayments /></ProtectedRoute>} />
          <Route path="/dentists" element={<ProtectedRoute><AvailableDentists /></ProtectedRoute>}/>
          <Route path="/dentists/:userId" element={<ProtectedRoute><DentistDetails /></ProtectedRoute>} />
          <Route path="appointment" element={<ProtectedRoute><Appointment/></ProtectedRoute>} />  
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
