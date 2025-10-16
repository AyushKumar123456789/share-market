import React, { useState, useContext, useEffect } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Signup = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [signupToken, setSignupToken] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [resendTimer, setResendTimer] = useState(180);
    const [canResend, setCanResend] = useState(false);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    useEffect(() => {
        let timerId;
        if (otpSent && resendTimer > 0) {
            timerId = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        } else if (resendTimer === 0) {
            setCanResend(true);
            clearInterval(timerId);
        }
        return () => clearInterval(timerId);
    }, [otpSent, resendTimer]);


    //Google OAuth

   const handleGoogleSuccess = async (credentialResponse) => {
        try {
            // Send the token from Google to our backend
            const res = await API.post('/auth/google-login', {
                token: credentialResponse.credential,
            });

            // On success, our backend gives us an app token. Use it to login.
            login(res.data);
            navigate('/');
        } catch (error) {
            console.error("Google Login Failed", error);
        }
    };

    const handleGoogleError = () => {
        console.log('Login Failed');
    };


    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const onOtpChange = (e) => setOtp(e.target.value);

    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await API.post('/auth/send-otp', formData);
            setSignupToken(res.data.signupToken);
            setOtpSent(true);
            setResendTimer(180);
            setCanResend(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setOtp('');
        await handleSendOtp();
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await API.post('/auth/verify-otp', { signupToken, otp });
            login(res.data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Create Account</h2>
            <p className="text-center text-gray-500 mb-6 text-sm">Join the community today!</p>
            
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">{error}</div>}

            {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-5">
                    <div>
                        <label htmlFor="name" className="sr-only">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                            </div>
                            <input id="name" name="name" type="text" required onChange={onChange} placeholder="Full Name"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className="sr-only">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                            </div>
                            <input id="email" name="email" type="email" required onChange={onChange} placeholder="Email address"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                            </div>
                            <input id="password" name="password" type="password" required onChange={onChange} placeholder="Password"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                        </div>
                    </div>
                    <div>
                        <button type="submit" disabled={loading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150">
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <p className="text-center text-gray-600 text-sm">An OTP has been sent to {formData.email}. Please enter it below.</p>
                    <div>
                        <label htmlFor="otp" className="sr-only">OTP</label>
                        <input id="otp" name="otp" type="text" required onChange={onOtpChange} placeholder="Enter OTP"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>
                    <div>
                        <button type="submit" disabled={loading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-150">
                            {loading ? 'Verifying...' : 'Verify & Create Account'}
                        </button>
                    </div>
                    <div className="text-center text-sm">
                        {canResend ? (
                            <button type="button" onClick={handleResendOtp} disabled={loading} className="font-medium text-green-600 hover:underline disabled:opacity-50">
                                {loading ? 'Sending...' : 'Resend OTP'}
                            </button>
                        ) : (
                            <p className="text-gray-500">
                                Resend OTP in {Math.floor(resendTimer / 60)}:{('0' + (resendTimer % 60)).slice(-2)}
                            </p>
                        )}
                    </div>
                </form>
            )}
            {/* Or login using google */}
            <div className="mt-3 mb-3">
                <p className="text-center text-sm text-gray-600">Or continue with</p>
            </div>
      

        {/* Google Button */}
            <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="filled_blue"
                        shape="square"
                    />
                </div>

            <p className="text-center mt-6 text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-green-600 hover:underline">
                Sign in
                </Link>
            </p>
        </div>
    );
};

export default Signup;