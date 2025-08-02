# !pip install mediapipe opencv-python pandas scikit-learn
import csv
import os
import numpy as np
import cv2
import mediapipe as mp
from datetime import datetime
import json
import pandas as pd
from collections import defaultdict

class InterviewPostureCollector:
    def __init__(self):
        self.mp_holistic = mp.solutions.holistic
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_hands = mp.solutions.hands
        
        # Essential classes for interview analysis
        self.classes = [
            "Good_Posture", "Slouching", "Forward_Head", "Shoulders_Hunched",
            "Leaning_Forward", "Leaning_Back", "Confident_Expression", 
            "Nervous_Expression", "Head_Down", "Fidgeting_Hands"
        ]
        
        # CORRECTED: Face landmark indices based on research
        self.LEFT_EYE_LANDMARKS = [463, 398, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382, 362]
        self.RIGHT_EYE_LANDMARKS = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7]
        self.LEFT_IRIS_LANDMARKS = [474, 475, 477, 476]
        self.RIGHT_IRIS_LANDMARKS = [469, 470, 471, 472]
        self.NOSE_LANDMARKS = [193, 168, 417, 122, 351, 196, 419, 3, 248, 236, 456, 198, 420, 131, 360, 49, 279, 48, 278, 219, 439, 59, 289, 218, 438, 237, 457, 44, 19, 274]
        self.MOUTH_LANDMARKS = [0, 267, 269, 270, 409, 306, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61, 185, 40, 39, 37]
        
        # Optimized key landmarks for interview analysis
        self.key_face_landmarks = {
            # Eyes (for gaze direction and confidence)
            'left_eye_inner': 362,      
            'left_eye_outer': 263,       
            'right_eye_inner': 133,     
            'right_eye_outer': 33,      
            'left_eye_center': 385,     
            'right_eye_center': 160,    
            
            # Iris (for precise gaze tracking)
            'left_iris_center': 474,    
            'right_iris_center': 469,   
            
            # Nose (for head orientation)
            'nose_tip': 3,              
            'nose_bridge': 168,         
            'nose_left': 49,            
            'nose_right': 279,          
            
            # Mouth (for expression analysis)
            'mouth_left': 61,           
            'mouth_right': 291,         
            'mouth_top': 13,            
            'mouth_bottom': 14,         
            'mouth_center': 17,         
            
            # Face outline (for head posture)
            'chin_center': 175,         
            'jaw_left': 172,            
            'jaw_right': 397,           
            'forehead': 9,              
            
            # Eyebrows (for expression)
            'left_eyebrow_inner': 55,   
            'left_eyebrow_outer': 70,   
            'right_eyebrow_inner': 285, 
            'right_eyebrow_outer': 300, 
        }
        
        self.session_data = defaultdict(int)
        self.target_samples_per_class = 500  # 500 samples per class per user
        self.target_samples_per_user = 5000  # Total per user (500 × 10 classes)
        self.target_total_samples = 25000    # Target for entire project (5 users × 5000)
        
    def get_user_info(self):
        """Get user information and session setup"""
        print("="*70)
        print("MULTI-USER INTERVIEW POSTURE DATA COLLECTION SYSTEM")
        print("="*70)
        print(f"Date: 2025-08-02 02:24:45 UTC")
        print(f"Target: {self.target_samples_per_user:,} samples per user ({self.target_samples_per_class} per class)")
        print(f"Project Goal: {self.target_total_samples:,} total samples (4-5 users)")
        print("="*70)
        
        # Get username from input
        while True:
            user_id = input("\nEnter username for this data collection session: ").strip()
            if user_id:
                break
            else:
                print("Username cannot be empty. Please enter a valid username.")
        
        print(f"\nWelcome, {user_id}!")
        print(f"You'll be collecting {self.target_samples_per_user:,} samples total")
        
        # Show current dataset status
        self.show_dataset_status(user_id)
        
        # Get session preferences
        print(f"\nSESSION OPTIONS:")
        print("1. Collect specific class data")
        print("2. Balanced collection session (recommended)")
        print("3. Quick validation session (20 samples per class)")
        print("4. Debug mode (low quality threshold)")
        print("5. Show detailed dataset statistics")
        
        choice = input("Choose option (1-5): ").strip()
        
        if choice == "1":
            return self.single_class_session(user_id)
        elif choice == "2":
            return self.balanced_session(user_id)
        elif choice == "3":
            return self.validation_session(user_id)
        elif choice == "4":
            return self.debug_session(user_id)
        elif choice == "5":
            self.show_detailed_statistics()
            return self.get_user_info()  # Return to menu
        else:
            print("Invalid choice. Using balanced session.")
            return self.balanced_session(user_id)
    
    def show_dataset_status(self, current_user):
        """Show current dataset status"""
        print(f"\nCURRENT DATASET STATUS:")
        total_samples = 0
        user_samples = defaultdict(int)
        user_class_samples = defaultdict(lambda: defaultdict(int))
        
        for class_name in self.classes:
            csv_file = f"{class_name.lower()}_data.csv"
            if os.path.exists(csv_file):
                try:
                    df = pd.read_csv(csv_file)
                    count = len(df)
                    total_samples += count
                    
                    # Count samples per user
                    if 'user_id' in df.columns:
                        user_counts = df['user_id'].value_counts()
                        for user, user_count in user_counts.items():
                            user_samples[user] += user_count
                            user_class_samples[user][class_name] = user_count
                    
                    # Status for current class
                    current_user_count = len(df[df['user_id'] == current_user]) if 'user_id' in df.columns else 0
                    status = "Complete" if current_user_count >= self.target_samples_per_class else f"Need {self.target_samples_per_class - current_user_count} more"
                    print(f"  {class_name}: {current_user_count}/{self.target_samples_per_class} for {current_user} ({status})")
                    
                except Exception as e:
                    print(f"  {class_name}: Error reading file - {e}")
            else:
                print(f"  {class_name}: 0/{self.target_samples_per_class} for {current_user} (Need {self.target_samples_per_class})")
        
        print(f"\nUSER PROGRESS:")
        for user, count in user_samples.items():
            progress = (count / self.target_samples_per_user) * 100
            status = "Complete" if count >= self.target_samples_per_user else f"({progress:.1f}%)"
            print(f"  {user}: {count:,}/{self.target_samples_per_user:,} samples {status}")
        
        current_user_total = user_samples.get(current_user, 0)
        print(f"\nYOUR PROGRESS ({current_user}): {current_user_total:,}/{self.target_samples_per_user:,} samples")
        
        print(f"\nPROJECT PROGRESS:")
        print(f"  Total samples collected: {total_samples:,}")
        print(f"  Project target: {self.target_total_samples:,}")
        print(f"  Overall progress: {(total_samples / self.target_total_samples) * 100:.1f}%")
        print(f"  Active contributors: {len(user_samples)} users")
    
    def show_detailed_statistics(self):
        """Show detailed dataset statistics"""
        print(f"\nDETAILED DATASET STATISTICS:")
        print("="*50)
        
        user_class_matrix = defaultdict(lambda: defaultdict(int))
        total_by_class = defaultdict(int)
        total_by_user = defaultdict(int)
        
        for class_name in self.classes:
            csv_file = f"{class_name.lower()}_data.csv"
            if os.path.exists(csv_file):
                try:
                    df = pd.read_csv(csv_file)
                    if 'user_id' in df.columns:
                        user_counts = df['user_id'].value_counts()
                        for user, count in user_counts.items():
                            user_class_matrix[user][class_name] = count
                            total_by_class[class_name] += count
                            total_by_user[user] += count
                except:
                    pass
        
        # Print matrix
        print(f"\nSAMPLES BY USER AND CLASS:")
        print(f"{'User':<15}", end="")
        for class_name in self.classes:
            print(f"{class_name[:8]:<9}", end="")
        print("Total")
        
        print("-" * (15 + 9 * len(self.classes) + 5))
        
        for user in sorted(user_class_matrix.keys()):
            print(f"{user:<15}", end="")
            for class_name in self.classes:
                count = user_class_matrix[user][class_name]
                print(f"{count:<9}", end="")
            print(f"{total_by_user[user]}")
        
        print("-" * (15 + 9 * len(self.classes) + 5))
        print(f"{'TOTAL':<15}", end="")
        for class_name in self.classes:
            print(f"{total_by_class[class_name]:<9}", end="")
        print(f"{sum(total_by_class.values())}")
        
        input("\nPress Enter to continue...")
    
    def debug_session(self, user_id):
        """Debug session with low quality threshold"""
        print(f"\nDEBUG SESSION")
        print("Low quality threshold for testing landmark detection")
        
        debug_classes = [(self.classes[0], 50)]  # Just Good_Posture for testing
        return debug_classes, user_id, "debug"
    
    def balanced_session(self, user_id):
        """Collect data in a balanced way for current user"""
        print(f"\nBALANCED COLLECTION SESSION FOR {user_id}")
        print("This session will prioritize classes where you have the least data.")
        
        # Find classes that need more data for this user
        needed_classes = []
        for class_name in self.classes:
            csv_file = f"{class_name.lower()}_data.csv"
            current_count = 0
            
            if os.path.exists(csv_file):
                try:
                    df = pd.read_csv(csv_file)
                    if 'user_id' in df.columns:
                        current_count = len(df[df['user_id'] == user_id])
                except:
                    current_count = 0
            
            if current_count < self.target_samples_per_class:
                needed_classes.append((class_name, self.target_samples_per_class - current_count))
        
        if not needed_classes:
            print(f"Congratulations! You've completed all {self.target_samples_per_user:,} samples!")
            print("You can still contribute to validation or help with specific classes.")
            return None, None, None
        
        # Sort by need (most needed first)
        needed_classes.sort(key=lambda x: x[1], reverse=True)
        
        print(f"\nYOUR PRIORITY CLASSES (most needed first):")
        total_needed = 0
        for i, (class_name, needed) in enumerate(needed_classes, 1):
            total_needed += needed
            print(f"  {i}. {class_name}: need {needed} more samples")
        
        print(f"\nTotal remaining for {user_id}: {total_needed:,} samples")
        remaining_percentage = (total_needed / self.target_samples_per_user) * 100
        print(f"Progress: {100 - remaining_percentage:.1f}% complete")
        
        return needed_classes, user_id, "balanced"
    
    def single_class_session(self, user_id):
        """Collect data for a specific class"""
        print(f"\nSINGLE CLASS SESSION")
        print("Available classes:")
        for i, class_name in enumerate(self.classes, 1):
            # Show current progress for this user in this class
            csv_file = f"{class_name.lower()}_data.csv"
            current_count = 0
            if os.path.exists(csv_file):
                try:
                    df = pd.read_csv(csv_file)
                    if 'user_id' in df.columns:
                        current_count = len(df[df['user_id'] == user_id])
                except:
                    pass
            print(f"  {i}. {class_name} (you have {current_count}/{self.target_samples_per_class})")
        
        try:
            choice = int(input(f"Select class (1-{len(self.classes)}): ")) - 1
            if 0 <= choice < len(self.classes):
                selected_class = self.classes[choice]
                return [(selected_class, 100)], user_id, "single"
            else:
                print("Invalid choice")
                return None, None, None
        except:
            print("Invalid input")
            return None, None, None
    
    def validation_session(self, user_id):
        """Quick session to validate existing data"""
        print(f"\nVALIDATION SESSION")
        print("Quick collection of 20 samples per class for validation")
        
        validation_classes = [(class_name, 20) for class_name in self.classes]
        return validation_classes, user_id, "validation"
    
    def initialize_csv(self, class_name):
        """Initialize CSV with optimized headers"""
        csv_filename = f"{class_name.lower()}_data.csv"
        
        if not os.path.exists(csv_filename):
            landmarks = ['class', 'timestamp', 'user_id', 'session_type', 'quality_score']
            
            # Pose landmarks (132 columns)
            for val in range(1, 34):
                landmarks += [f'pose_x{val}', f'pose_y{val}', f'pose_z{val}', f'pose_v{val}']
            
            # Key face landmarks only (24 landmarks × 4 = 96 columns)
            for landmark_name in self.key_face_landmarks.keys():
                landmarks += [f'face_{landmark_name}_x', f'face_{landmark_name}_y', 
                             f'face_{landmark_name}_z', f'face_{landmark_name}_v']
            
            # Hand landmarks (168 columns total)
            for hand in ['left', 'right']:
                for val in range(1, 22):
                    landmarks += [f'{hand}_hand_x{val}', f'{hand}_hand_y{val}', 
                                 f'{hand}_hand_z{val}', f'{hand}_hand_v{val}']
            
            with open(csv_filename, mode='w', newline='') as f:
                csv_writer = csv.writer(f, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
                csv_writer.writerow(landmarks)
            
            print(f"Created optimized CSV: {csv_filename}")
            print(f"Total columns: {len(landmarks)} (5 metadata + 132 pose + 96 face + 168 hands = 401 total)")
        
        return csv_filename
    
    def calculate_quality_score(self, results):
        """Calculate data quality score with detailed feedback - FIXED: NO UNICODE"""
        score = 0
        max_score = 4
        details = {}
        
        # FIXED: Use only ASCII characters
        if results.pose_landmarks:
            score += 1
            details['pose'] = 'YES'  # ← Changed from ✅ to YES
        else:
            details['pose'] = 'NO'   # ← Changed from ❌ to NO
            
        if results.face_landmarks:
            score += 1
            details['face'] = 'YES'  # ← Changed from ✅ to YES
        else:
            details['face'] = 'NO'   # ← Changed from ❌ to NO
            
        if results.left_hand_landmarks:
            score += 1
            details['left_hand'] = 'YES'  # ← Changed from ✅ to YES
        else:
            details['left_hand'] = 'NO'   # ← Changed from ❌ to NO
            
        if results.right_hand_landmarks:
            score += 1
            details['right_hand'] = 'YES'  # ← Changed from ✅ to YES
        else:
            details['right_hand'] = 'NO'   # ← Changed from ❌ to NO
        
        quality_percentage = (score / max_score) * 100
        return quality_percentage, details
    
    def extract_key_face_landmarks(self, face_landmarks):
        """Extract only key face landmarks using correct indices"""
        if not face_landmarks:
            return [0.0] * (len(self.key_face_landmarks) * 4)
        
        key_points = []
        total_landmarks = len(face_landmarks.landmark)
        
        for landmark_name, landmark_idx in self.key_face_landmarks.items():
            try:
                if landmark_idx < total_landmarks:
                    landmark = face_landmarks.landmark[landmark_idx]
                    key_points.extend([landmark.x, landmark.y, landmark.z, landmark.visibility])
                else:
                    print(f"Warning: Landmark index {landmark_idx} ({landmark_name}) >= {total_landmarks}")
                    key_points.extend([0.0, 0.0, 0.0, 0.0])
            except Exception as e:
                print(f"Error extracting {landmark_name} (index {landmark_idx}): {e}")
                key_points.extend([0.0, 0.0, 0.0, 0.0])
        
        return key_points
    
    def collect_class_data(self, class_name, target_samples, user_id, session_type):
        """Collect data for a specific class with manual start"""
        csv_filename = self.initialize_csv(class_name)
        
        # Show instructions for the class
        self.show_class_instructions(class_name)
        
        print(f"\nCAMERA SETUP PHASE")
        print("="*50)
        print(f"Target: {target_samples} samples for {class_name}")
        print(f"User: {user_id}")
        print("Next steps:")
        print("  1. Camera will open for preview")
        print("  2. Adjust your position and posture")
        print("  3. Press SPACEBAR when ready to start collecting")
        print("  4. System will begin automatic collection")
        
        input("\nPress Enter to open camera preview...")
        
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("ERROR: Could not open camera!")
            return 0
            
        # Manual start system
        collecting = False  # Start in preview mode
        preview_mode = True
        frame_count = 0
        good_quality_count = 0
        low_quality_count = 0
        
        # Adjust quality threshold based on session type
        quality_threshold = 25 if session_type == "debug" else 50
        
        print(f"\nCAMERA PREVIEW MODE ACTIVE")
        print(f"Quality threshold: {quality_threshold}% | Session: {session_type}")
        print("="*70)
        print("PREVIEW CONTROLS:")
        print("  SPACEBAR = Start collecting data")
        print("  'p' = Pause/resume collection (after started)")
        print("  'q' = Quit completely")
        print("  'n' = Skip to next class")
        print("="*70)
        
        with self.mp_holistic.Holistic(
            min_detection_confidence=0.3,
            min_tracking_confidence=0.3
        ) as holistic:
            
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    print("ERROR: Could not read frame!")
                    break
                
                frame_count += 1
                
                image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                image.flags.writeable = False
                results = holistic.process(image)
                image.flags.writeable = True
                image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
                
                # Calculate quality score with details
                quality_score, quality_details = self.calculate_quality_score(results)
                
                # Draw landmarks
                self.draw_landmarks(image, results)
                
                # Different status overlays for preview vs collection mode
                if preview_mode:
                    # PREVIEW MODE STATUS - PURE ASCII ONLY
                    status_lines = [
                        f"PREVIEW MODE - {class_name}",
                        f"User: {user_id} | Target: {target_samples} samples",
                        f"Quality: {quality_score:.0f}% (need >={quality_threshold}%) | Press SPACEBAR to START",
                        f"Pose:{quality_details['pose']} Face:{quality_details['face']} L.Hand:{quality_details['left_hand']} R.Hand:{quality_details['right_hand']}",
                        f"Adjust your posture, then press SPACEBAR when ready!"
                    ]
                    
                    for i, line in enumerate(status_lines):
                        y_pos = 25 + (i * 22)
                        color = (0, 128, 60)  # Dark green for preview mode
                        cv2.putText(image, line, (10, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.45, color, 1)
                    
                else:
                    # COLLECTION MODE STATUS - PURE ASCII ONLY
                    progress = (good_quality_count / target_samples) * 100
                    status_lines = [
                        f"COLLECTING - {class_name}",
                        f"User: {user_id} | Progress: {good_quality_count}/{target_samples} ({progress:.1f}%)",
                        f"Quality: {quality_score:.0f}% (need >={quality_threshold}%) | Status: {'RECORDING' if collecting else 'PAUSED'}",
                        f"Pose:{quality_details['pose']} Face:{quality_details['face']} L.Hand:{quality_details['left_hand']} R.Hand:{quality_details['right_hand']}"
                    ]
                    
                    for i, line in enumerate(status_lines):
                        y_pos = 25 + (i * 22)
                        color = (0, 255, 0) if collecting and quality_score >= quality_threshold else (0, 165, 255)
                        cv2.putText(image, line, (10, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.45, color, 1)
                
                # Save high-quality samples (only when collecting and not in preview mode)
                if not preview_mode and collecting and quality_score >= quality_threshold:
                    try:
                        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        row = [class_name, timestamp, user_id, session_type, quality_score]
                        
                        # Extract all landmark data
                        pose_row = self.extract_pose_landmarks(results.pose_landmarks)
                        face_row = self.extract_key_face_landmarks(results.face_landmarks)
                        left_hand_row = self.extract_hand_landmarks(results.left_hand_landmarks)
                        right_hand_row = self.extract_hand_landmarks(results.right_hand_landmarks)
                        
                        row.extend(pose_row + face_row + left_hand_row + right_hand_row)
                        
                        with open(csv_filename, mode='a', newline='') as f:
                            csv_writer = csv.writer(f, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
                            csv_writer.writerow(row)
                        
                        good_quality_count += 1
                        print(f"Sample #{good_quality_count}/{target_samples} saved | Quality: {quality_score:.0f}%")
                        
                        # Check if target reached
                        if good_quality_count >= target_samples:
                            print(f"TARGET REACHED! Collected {good_quality_count} samples for {class_name}")
                            break
                        
                    except Exception as e:
                        print(f"Error saving data: {e}")
                        import traceback
                        traceback.print_exc()
                        
                elif not preview_mode and collecting and quality_score < quality_threshold:
                    low_quality_count += 1
                    if low_quality_count % 60 == 0:  # Print every 60 low quality frames
                        print(f"{low_quality_count} low quality frames | Last: {quality_score:.0f}% {quality_details}")
                
                cv2.imshow(f'Interview Posture Data Collection - {class_name} - {user_id}', image)
                
                key = cv2.waitKey(1) & 0xFF
                
                if key == ord(' '):  # SPACEBAR
                    if preview_mode:
                        preview_mode = False
                        collecting = True
                        print(f"\nCOLLECTION STARTED for {class_name}!")
                        print(f"Collecting {target_samples} samples...")
                        print(f"Controls: 'p'=pause/resume | 'q'=quit | 'n'=next class")
                    else:
                        print(f"Already in collection mode. Use 'p' to pause/resume.")
                        
                elif key == ord('q'):
                    print(f"Quitting {class_name} collection...")
                    break
                    
                elif key == ord('p'):
                    if not preview_mode:
                        collecting = not collecting
                        print(f"Collection {'resumed' if collecting else 'paused'}")
                    else:
                        print(f"Still in preview mode. Press SPACEBAR to start collecting first.")
                        
                elif key == ord('n'):
                    print(f"Moving to next class...")
                    break
        
        cap.release()
        cv2.destroyAllWindows()
        
        print(f"\nCOLLECTION SUMMARY FOR {class_name} ({user_id}):")
        print(f"   High-quality samples saved: {good_quality_count}")
        print(f"   Total frames processed: {frame_count}")
        print(f"   Low-quality frames skipped: {low_quality_count}")
        if frame_count > 0:
            success_rate = (good_quality_count / frame_count) * 100
            print(f"   Success rate: {success_rate:.1f}%")
        
        return good_quality_count
    
    def extract_pose_landmarks(self, pose_landmarks):
        """Extract pose landmarks"""
        if pose_landmarks:
            return list(np.array([[lm.x, lm.y, lm.z, lm.visibility] 
                                for lm in pose_landmarks.landmark]).flatten())
        return [0.0] * (33 * 4)
    
    def extract_hand_landmarks(self, hand_landmarks):
        """Extract hand landmarks"""
        if hand_landmarks:
            return list(np.array([[lm.x, lm.y, lm.z, lm.visibility] 
                                for lm in hand_landmarks.landmark]).flatten())
        return [0.0] * (21 * 4)
    
    def draw_landmarks(self, image, results):
        """Draw all landmarks on image"""
        if results.face_landmarks:
            self.mp_drawing.draw_landmarks(image, results.face_landmarks, 
                                         self.mp_face_mesh.FACEMESH_CONTOURS)
        if results.pose_landmarks:
            self.mp_drawing.draw_landmarks(image, results.pose_landmarks, 
                                         self.mp_holistic.POSE_CONNECTIONS)
        if results.left_hand_landmarks:
            self.mp_drawing.draw_landmarks(image, results.left_hand_landmarks, 
                                         self.mp_hands.HAND_CONNECTIONS)
        if results.right_hand_landmarks:
            self.mp_drawing.draw_landmarks(image, results.right_hand_landmarks, 
                                         self.mp_hands.HAND_CONNECTIONS)
    
    def show_class_instructions(self, class_name):
        """Show specific instructions for each class"""
        instructions = {
            "Good_Posture": [
                "- Sit straight with back against chair",
                "- Shoulders relaxed and pulled back",
                "- Head upright, eyes focused on camera",
                "- Confident, alert expression",
                "- Hands visible and naturally positioned"
            ],
            "Slouching": [
                "- Let your back curve forward (away from chair)",
                "- Round shoulders inward toward chest", 
                "- Allow chest to cave in slightly",
                "- Maintain relaxed but poor spinal alignment"
            ],
            "Forward_Head": [
                "- Push head and neck forward toward camera",
                "- Create prominent 'chicken neck' posture",
                "- Keep body relatively straight",
                "- Common when leaning toward screens"
            ],
            "Shoulders_Hunched": [
                "- Actively raise shoulders toward your ears",
                "- Tense shoulder and neck muscles",
                "- Shows physical stress or tension",
                "- Keep rest of posture relatively normal"
            ],
            "Leaning_Forward": [
                "- Lean entire torso toward the camera",
                "- Move whole upper body forward from hips",
                "- Shows nervousness, eagerness, or over-engagement",
                "- Maintain forward lean consistently"
            ],
            "Leaning_Back": [
                "- Lean entire torso away from camera", 
                "- Push back into chair, create distance",
                "- Appears disinterested or overly casual",
                "- May suggest disengagement from conversation"
            ],
            "Confident_Expression": [
                "- Maintain steady eye contact with camera",
                "- Show slight smile or pleasant, alert expression",
                "- Keep facial muscles engaged but relaxed",
                "- Project confidence and professional presence"
            ],
            "Nervous_Expression": [
                "- Display tense, worried facial muscles",
                "- Show furrowed brow or concerned look",
                "- Tight lips, forced smile, or anxious expression",
                "- Project stress, uncertainty, or nervousness"
            ],
            "Head_Down": [
                "- Look down frequently (avoid camera eye contact)",
                "- Tilt head downward toward desk/lap",
                "- Appears withdrawn, shy, or lacking confidence",
                "- Shows avoidance of direct engagement"
            ],
            "Fidgeting_Hands": [
                "- Continuously change hand positions",
                "- Touch face, hair, clothing, or objects",
                "- Tap fingers, adjust items, show restless energy",
                "- Display nervous hand movements throughout"
            ]
        }
        
        print(f"\nDETAILED INSTRUCTIONS FOR {class_name}:")
        print("="*50)
        for instruction in instructions.get(class_name, ["No specific instructions available"]):
            print(f"  {instruction}")
        print("\nSETUP TIPS:")
        print("  - Take time to get into the correct posture")
        print("  - Ensure good lighting on your face and upper body")
        print("  - Keep hands visible when relevant to the pose")
        print("  - Get comfortable - you'll hold this pose for several minutes")
        print("  - Camera will open in PREVIEW mode first")
        print("  - Press SPACEBAR only when you're properly positioned")
    
    def run(self):
        """Main collection loop"""
        session_info = self.get_user_info()
        
        if not session_info[0]:
            print("Session cancelled.")
            return
        
        needed_classes, user_id, session_type = session_info
        
        print(f"\nSTARTING {session_type.upper()} SESSION")
        print(f"User: {user_id}")
        print(f"Date: 2025-08-02 02:24:45 UTC")
        print("="*70)
        print("NEW FEATURE: MANUAL START")
        print("  • Camera opens in PREVIEW mode")
        print("  • Adjust your posture properly")
        print("  • Press SPACEBAR when ready to collect")
        print("  • System starts automatic collection")
        print("="*70)
        
        total_collected = 0
        
        for class_name, target_samples in needed_classes:
            print(f"\nNEXT CLASS: {class_name}")
            print(f"Target: {target_samples} samples")
            
            continue_choice = input("Continue with this class? (y/n/skip): ").lower()
            if continue_choice == 'n':
                print("Session terminated by user.")
                break
            elif continue_choice == 'skip':
                print(f"Skipping {class_name}")
                continue
            
            collected = self.collect_class_data(class_name, target_samples, user_id, session_type)
            total_collected += collected
            
            if collected < target_samples:
                print(f"Only collected {collected}/{target_samples} samples for {class_name}")
                continue_session = input("Continue to next class anyway? (y/n): ").lower()
                if continue_session == 'n':
                    print("Session terminated by user.")
                    break
        
        print(f"\nSESSION COMPLETED!")
        print("="*70)
        print(f"User: {user_id}")
        print(f"Total samples collected this session: {total_collected:,}")
        print(f"Session ended: 2025-08-02 02:24:45 UTC")
        print("="*70)
        print("Updated dataset status:")
        self.show_dataset_status(user_id)
        
        # Show progress toward project goal
        total_all_users = 0
        try:
            for class_name in self.classes:
                csv_file = f"{class_name.lower()}_data.csv"
                if os.path.exists(csv_file):
                    df = pd.read_csv(csv_file)
                    total_all_users += len(df)
        except:
            pass
        
        project_progress = (total_all_users / self.target_total_samples) * 100
        print(f"\nPROJECT PROGRESS: {total_all_users:,}/{self.target_total_samples:,} samples ({project_progress:.1f}%)")

if __name__ == "__main__":
    collector = InterviewPostureCollector()
    collector.run()