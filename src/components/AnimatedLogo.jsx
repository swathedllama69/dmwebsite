import React from 'react';

const DEVOLT_LOGO_URL = "http://devoltmould.com.ng/resources/devolt_logo2.png";

/**
 * AnimatedLogo component displays the brand logo with optional scroll animation.
 * @param {string} size - Tailwind size class (e.g., 'w-10 h-10', 'w-16 h-16')
 * @param {boolean} isScrolling - Apply the continuous scroll rotation effect.
 * @param {string} className - Additional classes.
 */
export const AnimatedLogo = ({ size = 'w-10 h-10', isScrolling = false, className = '' }) => {
    return (
        <img
            src={DEVOLT_LOGO_URL}
            alt="Devolt Mould Logo"
            className={`${size} ${className} transition-all duration-300 ${isScrolling ? 'logo-scrolling-animate' : ''}`}
        />
    );
};