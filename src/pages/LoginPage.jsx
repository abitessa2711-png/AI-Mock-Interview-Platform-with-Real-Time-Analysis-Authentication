import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import AuthService from '../services/authService';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    // ✅ Clear form completely when page loads or component mounts
    useEffect(() => {
        setEmail('');
        setPassword('');
        setError(null);
        setSuccess(null);
        
        // Clear any cached form values
        const form = document.querySelector('.auth-form');
        if (form) {
            form.reset();
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const data = await AuthService.loginUser({ email, password });
            
            // ✅ Clear form on success
            setEmail('');
            setPassword('');
            
            // ✅ Reset form element
            if (e.target) {
                e.target.reset();
            }
            
            const userName = data?.user?.name || data?.name || "User";
            setSuccess(`✅ Welcome back, ${userName}! Redirecting...`);
            
            setTimeout(() => {
                navigate('/');
            }, 1000);
        } catch (err) {
            console.error("Login Error:", err);
            // ✅ Show error but don't redirect
            setError("❌ " + (err.message || "Invalid credentials or server error."));
            
            // Clear error after 4 seconds
            setTimeout(() => {
                setError(null);
            }, 4000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <motion.div 
                className="auth-card glass-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <h2>Login to <span className="gradient-text">SkillPulse</span></h2>
                
                <form onSubmit={handleLogin} className="auth-form" autoComplete="off">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            required 
                            className="auth-input" 
                            placeholder="you@example.com"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            disabled={loading}
                            autoComplete="off"
                            data-form-type="other"
                            spellCheck="false"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            required 
                            className="auth-input" 
                            placeholder="••••••••"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            disabled={loading}
                            autoComplete="new-password"
                            data-form-type="other"
                        />
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="error-text"
                            style={{
                                color: "#ff3366",
                                background: "rgba(255,51,102,0.08)",
                                border: "1px solid rgba(255,51,102,0.2)",
                                borderRadius: "8px",
                                padding: "10px",
                                fontSize: "0.85rem"
                            }}
                        >
                            {error}
                        </motion.div>
                    )}
                    
                    {success && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="success-text" 
                            style={{
                                color: 'var(--status-good)', 
                                textAlign: 'center',
                                background: "rgba(0,255,136,0.08)",
                                border: "1px solid rgba(0,255,136,0.2)",
                                borderRadius: "8px",
                                padding: "10px",
                                fontSize: "0.85rem"
                            }}
                        >
                            {success}
                        </motion.div>
                    )}

                    <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                        <LogIn size={18} /> {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="auth-link">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
