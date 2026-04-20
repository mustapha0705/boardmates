const signup = async (req, res) => {
    try {
        res.status(200).json({ message: "Signup successful"});
    } catch (error) {
        res.status(500).json({ message: "Signup failed" });
    }
}

const login = async (req, res) => {
    try {
        res.status(200).json({ message: "Login successful" });
    } catch (error) {
        res.status(500).json({ message: "Login failed" });
    }
}

export { signup, login };