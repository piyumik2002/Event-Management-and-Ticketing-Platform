import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation(); 

  //The Register Form will only be displayed if the URL is exactly '/register'..
  const isRegister = location.pathname === '/register'; 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(''); 
  const [success, setSuccess] = useState(''); 
  const [loading, setLoading] = useState(false);

  //Roles, Organization Name and File keep state
  const [role, setRole] = useState('customer'); 
  const [organizationName, setOrganizationName] = useState('');
  const [verificationDoc, setVerificationDoc] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    setLoading(true);

    try {
      if (isRegister) {
        //Using FormData to send a file to the backend
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('role', role);

        // Only if the user is an Organizer, these two data items are added to FormData.
        if (role === 'organizer') {
          formData.append('organizationName', organizationName);
          if (verificationDoc) {
            formData.append('verificationDoc', verificationDoc);
          } else {
            setLoading(false);
            return setError('Please upload your NIC or Business Registration document.');
          }
        }

        // 1. Register API Call
        await axios.post('http://localhost:5000/api/auth/register', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        setLoading(false);
        
        if (role === 'organizer') {
          setSuccess('Registration submitted! Your account is pending verification. Please wait for Admin approval. ⏳');
        } else {
          setSuccess('Registration successful! Please sign in with your credentials. 🎉');
          navigate('/login', { state: location.state }); 
        }
        
        //clear Form 
        setEmail(''); setPassword(''); setName(''); setOrganizationName(''); setVerificationDoc(null); setRole('customer');
      } else {
        // 2. Login API Call
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          email,
          password,
        });
        
        //store data in LocalStorage 
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('userInfo', JSON.stringify(response.data));

        setLoading(false);
        
        //Redirecting to the correct page based on the role of the logged in person
        const userRole = response.data.role;

        //Sending to separate dashboards according to role
        if (userRole === 'admin') {
          // If you are an admin, you will be sent directly to the Admin Dashboard.
          navigate('/admin');
        } else if (userRole === 'organizer') {
          // If you are an organizer, you will be sent to the Organizer Dashboard.
          navigate('/organizer/dashboard');
        } else {
          // If you are a regular customer, you will be sent to the Home page or the previous page.
          const redirectTo = location.state?.from || '/';
          navigate(redirectTo);
        }
        
        window.location.reload();
      }
    } catch (err) {
      setLoading(false);
      
      if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
      } else {
          setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl bg-slate-900 p-8 border border-slate-800 shadow-xl">
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          {isRegister ? 'Create an Account 🎉' : 'Welcome Back! 👋'}
        </h2>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400 text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Piyumi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Register As</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="customer">Customer</option>
                  <option value="organizer">Organizer</option>
                </select>
              </div>

              {role === 'organizer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Organization / Cinema Name</label>
                    <input
                      type="text"
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Liberty Cinema"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Upload NIC & BR Document (Image/PDF)</label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => setVerificationDoc(e.target.files[0])}
                      className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-sm text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-600"
                      required
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 py-3 font-semibold text-slate-950 transition-colors mt-2 disabled:bg-emerald-700 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : isRegister ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              if (isRegister) {
                navigate('/login', { state: location.state }); 
              } else {
                navigate('/register', { state: location.state });
              }
              setError('');
              setSuccess('');
              setRole('customer');
            }}
            className="text-emerald-400 hover:underline font-medium"
          >
            {isRegister ? 'Sign In' : 'Register Here'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;