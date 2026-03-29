import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { signupUser } from "../services/authService";

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // ✅ Clear form completely when page loads or component mounts
    useEffect(() => {
        setName('');
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

    const handleSignup = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError(null);
        setSuccess(null);

        // ✅ Validation
        if (!name.trim()) {
            setError("Please enter your full name.");
            setLoading(false);
            return;
        }
        if (!email.trim()) {
            setError("Please enter a valid email.");
            setLoading(false);
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            setLoading(false);
            return;
        }

        try {
            // ✅ CALL SERVICE
            const data = await signupUser({ name, email, password });

            // ✅ SUCCESS - Clear form and show success message
            setName('');
            setEmail('');
            setPassword('');
            
            // ✅ Reset form element
            if (e.target) {
                e.target.reset();
            }
            
            setSuccess("✅ Account created successfully! Redirecting to login... 🚀");

            // ✅ Redirect to Login after 1.5 seconds
            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err) {
            // ✅ ERROR - Show error but don't redirect
            setError("❌ " + (err.message || "Signup failed. Please try again."));
            
            // Clear error after 4 seconds so user can retry
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
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div style={{ textAlign: "center", marginBottom: "10px" }}>
                    <h2>
                        Create <span className="gradient-text">Account</span>
                    </h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                        Join SkillPulse AI and master your interviews
                    </p>
                </div>

                <form onSubmit={handleSignup} className="auth-form" autoComplete="off">

                    {/* NAME */}
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            required
                            className="auth-input"
                            placeholder="e.g. Abinaya"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                            autoComplete="off"
                            data-form-type="other"
                            spellCheck="false"
                        />
                    </div>

                    {/* EMAIL */}
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
                        />
                    </div>

                    {/* PASSWORD */}
                    <div className="form-group">
                        <label>
                            Password{" "}
                            <span style={{ fontSize: "0.75rem", color: "gray" }}>
                                (min 6 chars)
                            </span>
                        </label>
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

                    {/* ERROR */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                color: "#ff3366",
                                background: "rgba(255,51,102,0.08)",
                                border: "1px solid rgba(255,51,102,0.2)",
                                borderRadius: "8px",
                                padding: "10px",
                                fontSize: "0.85rem"
                            }}
                        >
                            ❌ {error}
                        </motion.div>
                    )}

                    {/* SUCCESS */}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                color: "#00ff88",
                                background: "rgba(0,255,136,0.08)",
                                border: "1px solid rgba(0,255,136,0.2)",
                                borderRadius: "8px",
                                padding: "10px",
                                fontSize: "0.85rem",
                                textAlign: "center"
                            }}
                        >
                            ✅ {success}
                        </motion.div>
                    )}

                    {/* BUTTON */}
                    <button
                        type="submit"
                        className="btn btn-primary auth-submit"
                        disabled={loading}
                    >
                        <UserPlus size={18} />
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>

                </form>

                <p className="auth-link">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default SignupPage;