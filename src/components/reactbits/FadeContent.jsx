import { motion } from 'framer-motion';

const FadeContent = ({ children, blur = false, duration = 0.6, easing = "easeOut", initialOpacity = 0, className = "" }) => {
    return (
        <motion.div
            initial={{ opacity: initialOpacity, filter: blur ? "blur(10px)" : "blur(0px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration, ease: easing }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default FadeContent;
