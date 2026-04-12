"use client";
import { useState } from "react";
import styles from "./style.module.css";

/**
 * Loading skeleton component for 3D model
 * Shows while the model is being loaded
 */
export default function LoadingSkeleton({ progress = 0 }) {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.loadingContent}>
                {/* Animated logo or icon */}
                <div className={styles.loadingIcon}>
                    <div className={styles.spinner}></div>
                </div>

                {/* Loading text */}
                <h2 className={styles.loadingTitle}>Loading Experience</h2>
                <p className={styles.loadingSubtitle}>Preparing your journey...</p>

                {/* Progress bar */}
                <div className={styles.progressContainer}>
                    <div className={styles.progressTrack}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <span className={styles.progressText}>{Math.round(progress)}%</span>
                </div>

                {/* Loading tips */}
                <div className={styles.loadingTips}>
                    <p className={styles.tip}>💡 Tip: Use scroll to navigate through the story</p>
                </div>
            </div>
        </div>
    );
}
