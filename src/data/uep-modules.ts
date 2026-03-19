import type { UepModuleData } from '@/types';

export const uepModules: UepModuleData[] = [
  {
    id: 'lms',
    name: 'Learning Management System (LMS)',
    shortDescription: 'Complete course delivery platform with content management, student enrollment, and progress tracking.',
    features: [
      'Course creation and organization with hierarchical structure (modules, lessons, topics)',
      'Multiple content types: video, audio, documents, interactive media, and web resources',
      'Content sequencing and prerequisites ensuring proper learning progression',
      'Student enrollment management with batch and individual enrollment',
      'Progress tracking with automatic and manual completion markers',
      'Discussion forums for peer learning and instructor interaction',
      'Announcement and notification system for course communications',
      'Personalized learning dashboards showing course progress and upcoming deadlines'
    ],
    benefits: [
      'Educators can deliver consistent, well-organized courses across classrooms and institutions',
      'Students have 24/7 access to course materials enabling self-paced and blended learning',
      'Progress tracking reveals learning gaps allowing timely intervention',
      'Reduced administrative burden of manual enrollment and progress tracking'
    ],
    icon: 'BookOpen'
  },

  {
    id: 'otes',
    name: 'Online Testing / Secure Exam Platform (OTES)',
    shortDescription: 'Proctored online examination system with sophisticated security and various question types.',
    features: [
      'Exam creation with multiple question types: multiple choice, short answer, essay, matching, and fill-in-the-blank',
      'Randomization of questions and answer options to prevent cheating',
      'Detailed exam configuration: time limits, attempt limits, passing scores, and negative marking',
      'Secure browser lockdown preventing unauthorized access to external resources',
      'AI-powered proctoring detecting suspicious behavior and cheating attempts',
      'Question shuffling and custom question pools for different exam instances',
      'Automated grading for objective questions with manual grading for subjective',
      'Result analytics showing item difficulty, discrimination, and student performance'
    ],
    benefits: [
      'Eliminates paper-based testing reducing administrative overhead',
      'Advanced security measures ensure exam integrity and prevent cheating',
      'AI proctoring scales assessment to large student populations without human proctors',
      'Immediate feedback on objective questions supports learning while preventing cheating on subjective elements',
      'Analytics help educators refine questions and assessments over time'
    ],
    icon: 'FileCheck'
  },

  {
    id: 'sis',
    name: 'Student Information System',
    shortDescription: 'Centralized repository for student records, enrollment, academic history, and institutional data.',
    features: [
      'Student master data with personal, contact, and demographic information',
      'Academic profile tracking degree program, major, minor, and enrollment status',
      'Transcript management with comprehensive grade history and credit tracking',
      'Enrollment management across multiple terms and sessions',
      'Academic holds tracking preventing registration for outstanding requirements',
      'GPA calculations with support for weighted grades and grade point scales',
      'Registration workflows for course selection with prerequisite validation',
      'Document management storing degree audits, transcripts, and verifications'
    ],
    benefits: [
      'Single source of truth for student information eliminating manual reconciliation',
      'Automated prerequisite checking during registration prevents enrollment mistakes',
      'Academic holds management ensures students meet requirements before progression',
      'Transcript generation and verification streamline certification processes',
      'Comprehensive audit trails support institutional compliance and accreditation'
    ],
    icon: 'Users'
  },

  {
    id: 'ai-interview',
    name: 'AI Interview Platform',
    shortDescription: 'Artificial intelligence-powered assessment tool for evaluating technical skills and competencies.',
    features: [
      'Interactive coding challenges with real-time code execution and validation',
      'AI conversation engine understanding natural language questions and responses',
      'Dynamic difficulty adjustment based on student performance',
      'Comprehensive solution evaluation beyond simple pass/fail assessment',
      'Support for multiple programming languages and technical domains',
      'Interview simulation for soft skills and communication assessment',
      'Detailed feedback providing learning guidance and improvement areas',
      'Performance comparison against peers and institutional benchmarks'
    ],
    benefits: [
      'Evaluates both technical knowledge and problem-solving approach going beyond memorization',
      'Scalable assessment supporting placement testing and skills validation at scale',
      'Reduces bias in technical evaluation through consistent AI-based assessment',
      'Provides actionable feedback guiding student learning and skill development',
      'Supports employer partnerships with standardized skills assessment'
    ],
    icon: 'Brain'
  },

  {
    id: 'qb',
    name: 'Global Question Bank',
    shortDescription: 'Centralized repository of questions across all disciplines enabling rapid exam and assessment creation.',
    features: [
      'Massive question library across multiple disciplines and difficulty levels',
      'Taxonomy-based organization allowing filtering by topics, learning objectives, and cognitive levels',
      'Question metadata including learning outcomes, difficulty ratings, and historical performance',
      'Collaborative question review and approval workflows ensuring quality standards',
      'Version control enabling refinement of questions based on usage data',
      'Bulk question upload for importing existing institutional content',
      'Question analytics showing item difficulty, discrimination, and effectiveness',
      'Export capabilities for use in external assessment platforms'
    ],
    benefits: [
      'Educators rapidly create quality assessments without starting from scratch',
      'Consistent assessment across multiple sections and instructors of same course',
      'Question analytics identify poorly performing items for refinement',
      'Reusable questions increase efficiency while maintaining quality standards',
      'Historical performance data supports better prediction of student success'
    ],
    icon: 'Database'
  },

  {
    id: 'code-lab',
    name: 'Code Editor / Technical Lab',
    shortDescription: 'Cloud-based development environment for coding exercises, labs, and hands-on technical training.',
    features: [
      'Web-based code editor supporting multiple programming languages',
      'Integrated terminal and command-line access for system-level exercises',
      'Pre-configured development environments eliminating setup burden',
      'Real-time collaboration enabling pair programming and peer review',
      'Automated testing framework validating code against test cases',
      'Version control integration (Git) for tracking code changes',
      'Container-based sandboxing ensuring security and resource isolation',
      'Extension marketplace providing language-specific tools and libraries'
    ],
    benefits: [
      'Students practice coding immediately without complex setup reducing friction',
      'Automated testing provides instant feedback on code correctness',
      'Peer programming and review capabilities enhance collaborative learning',
      'Cloud-based access enables learning from any device anywhere',
      'Educators focus on concepts rather than troubleshooting environment issues'
    ],
    icon: 'Code'
  },

  {
    id: 'community',
    name: 'Community & Collaboration',
    shortDescription: 'Social learning platform fostering peer interaction, knowledge sharing, and community building.',
    features: [
      'Discussion forums organized by course, topic, and assignment',
      'Real-time messaging between students and instructors',
      'Study groups with dedicated spaces for collaborative learning',
      'Peer review and feedback mechanisms for assignment evaluation',
      'Knowledge base and wiki enabling crowdsourced documentation',
      'Question and answer portal with upvoting for helpful responses',
      'Social recognition system with badges and achievements',
      'Analytics revealing collaboration patterns and peer engagement'
    ],
    benefits: [
      'Peer learning enhances understanding as students explain concepts to each other',
      'Reduced instructor load as peer communities answer common questions',
      'Increased student engagement through sense of belonging and community',
      'Documentation built by community reduces instructor documentation burden',
      'Identifies engaged students and at-risk students through collaboration patterns'
    ],
    icon: 'Users'
  },

  {
    id: 'media-repo',
    name: 'Media Repository',
    shortDescription: 'Centralized digital asset management for all educational media including videos, images, and documents.',
    features: [
      'Hierarchical folder structure organizing media by course, department, or topic',
      'Video management with transcoding to multiple resolutions and formats',
      'Automatic video transcription and closed captioning for accessibility',
      'Advanced search with full-text and metadata-based filtering',
      'Version control tracking changes to documents and media',
      'Access control and permissions management at folder and file level',
      'Usage analytics tracking asset popularity and effectiveness',
      'Integration with LMS for embedded video and media within courses'
    ],
    benefits: [
      'Centralized storage eliminates version conflicts and confusion',
      'Accessibility features including transcripts and captions serve all learners',
      'Usage analytics identify effective assets and guide content investment',
      'Version control enables content evolution while preserving history',
      'Integrated metadata improves discoverability and reuse across institution'
    ],
    icon: 'Image'
  },

  {
    id: 'course-creation',
    name: 'Course Creation',
    shortDescription: 'Intuitive course design tools helping educators build structured, engaging courses systematically.',
    features: [
      'Drag-and-drop course builder with visual hierarchy of modules, lessons, and topics',
      'Pre-built course templates accelerating design for common course structures',
      'Learning outcome alignment showing connection between content, activities, and assessments',
      'Instructional design wizard guiding educators through pedagogical best practices',
      'Content import from various sources including previous course versions',
      'Activity recommendation engine suggesting engaging activities based on learning outcomes',
      'Preview mode allowing instructors to experience course as students would',
      'Course analytics showing completion rates, engagement, and performance by topic'
    ],
    benefits: [
      'Non-experts can build well-structured courses following instructional design principles',
      'Consistency across multiple sections ensures equitable learning experiences',
      'Templates accelerate course development reducing time from weeks to days',
      'Learning outcome alignment ensures assessments actually measure intended outcomes',
      'Course analytics guide continuous improvement based on real usage data'
    ],
    icon: 'BookPlus'
  },

  {
    id: 'gamification',
    name: 'Gamification',
    shortDescription: 'Engagement system using game mechanics—points, badges, leaderboards—to motivate learning.',
    features: [
      'Points system rewarding completion of learning activities and assessments',
      'Badges and achievements recognizing specific accomplishments and milestones',
      'Leaderboards motivating competition and engagement',
      'Progress visualization showing advancement toward goals and badges',
      'Custom challenge creation by instructors for specific learning objectives',
      'Difficulty levels allowing differentiated challenges for varied skill levels',
      'Social sharing enabling students to celebrate achievements with peers',
      'Integration with course requirements ensuring gamification supports learning goals'
    ],
    benefits: [
      'Increased engagement and motivation particularly for younger learners',
      'Progress visualization sustains effort toward long-term goals',
      'Healthy competition motivates effort without high-stakes pressure',
      'Achievement recognition provides intrinsic motivation beyond grades',
      'Flexible difficulty adapts challenges to individual skill levels'
    ],
    icon: 'Trophy'
  },

  {
    id: 'reports',
    name: 'Reports & Analytics',
    shortDescription: 'Comprehensive analytics and reporting tools revealing learning patterns, performance trends, and outcomes.',
    features: [
      'Customizable dashboards showing key metrics at student, course, and institutional level',
      'Predefined reports for common queries: student performance, course effectiveness, completion rates',
      'Ad-hoc report builder enabling creation of custom reports without technical expertise',
      'Learning analytics identifying at-risk students and intervention opportunities',
      'Predictive analytics forecasting student success based on engagement patterns',
      'Data export to external tools for further analysis',
      'Drill-down capabilities exploring details behind aggregate metrics',
      'Comparative analytics benchmarking against peer institutions and historical trends'
    ],
    benefits: [
      'Early identification of at-risk students enables timely intervention',
      'Course effectiveness analytics guide continuous improvement',
      'Learning analytics reveal how engagement predicts success',
      'Data-driven decisions replace subjective judgment',
      'Accountability reporting documents learning outcomes for accreditation'
    ],
    icon: 'BarChart3'
  },

  {
    id: 'live-class',
    name: 'Live Class Integration',
    shortDescription: 'Integrated video conferencing enabling synchronous learning with recording and interactive features.',
    features: [
      'High-quality video and audio with low-latency communication',
      'Screen sharing for demonstrating concepts and collaborative work',
      'Whiteboard and annotation tools for interactive explanation',
      'Breakout rooms enabling small group discussions during class',
      'Q&A functionality with question prioritization and answering',
      'Hand-raising feature for orderly participation',
      'Automatic recording with editing and clipping capabilities',
      'Integration with course materials and recordings available in LMS'
    ],
    benefits: [
      'Synchronous learning maintains real-time interaction and engagement',
      'Recording enables students to review content and catch up if absent',
      'Interactive features transform video into active learning experience',
      'Breakout rooms scale interactive discussion to large classes',
      'Combination of live and recorded enables flexible blended learning'
    ],
    icon: 'Video'
  },

  {
    id: 'proctoring',
    name: 'Proctoring & Anti-Cheating',
    shortDescription: 'Comprehensive security system preventing cheating in assessments through monitoring and detection.',
    features: [
      'AI-powered suspicious behavior detection flagging abnormal activity',
      'Biometric authentication verifying student identity at exam start',
      'Secure browser lockdown preventing access to external resources',
      'Camera and microphone monitoring during exam (with student consent)',
      'Screen recording enabling post-exam review of suspicious activity',
      'Keystroke analysis detecting copy-paste and unusual patterns',
      'Human proctor support for high-stakes exams requiring verification',
      'Detailed audit trails documenting all exam activity and interventions'
    ],
    benefits: [
      'Maintains academic integrity enabling valid assessment of learning',
      'Deters cheating attempts reducing the temptation and perceived opportunity',
      'AI scales assessment integrity to large populations without proportional proctor cost',
      'Appeals process ensures fair treatment of flagged activity',
      'Audit trails document assessment process supporting institutional defense'
    ],
    icon: 'Shield'
  },

  {
    id: 'exam-lifecycle',
    name: 'Exam Lifecycle Management',
    shortDescription: 'End-to-end workflow management for exams from planning through results, reporting, and improvement.',
    features: [
      'Exam scheduling and calendar management coordinating assessment dates',
      'Blueprint creation defining exam coverage and question distribution',
      'Question pool management and test assembly from question banks',
      'Pre-exam setup including student notifications and technical verification',
      'Real-time proctor dashboard monitoring active exams and flagging issues',
      'Result processing with automatic grading and student notification',
      'Grade reconciliation ensuring accuracy before posting to academic record',
      'Post-exam analytics identifying effective questions and improvement areas'
    ],
    benefits: [
      'Structured workflow ensures no assessment steps are missed',
      'Scheduling and notifications reduce last-minute problems and no-shows',
      'Pre-exam verification catches technical issues before assessment begins',
      'Real-time monitoring enables intervention if problems occur during exam',
      'Post-exam analytics drive continuous improvement of assessments',
      'Grade reconciliation ensures academic record accuracy'
    ],
    icon: 'CheckCircle'
  },
];
