require('dotenv').config();
const bcrypt = require('bcryptjs');
const { initDatabase } = require('../config/db');
const { initModels } = require('../models');

const exerciseList = [
  {
    name: 'Diaphragmatic Box Breathing',
    description: 'Inhale for 4s, hold for 4s, exhale slowly for 4s, hold for 4s. Calms sympathetic nervous system, prevents bronchospasms, and stabilizes heart rate.',
    video_url: 'https://www.youtube.com/embed/1Dv-ldGLnIY',
    intensity: 'low',
    safe_for_asthma: true,
    safe_for_joint: true,
    safe_for_pcos: true,
    safe_for_postnatal: true,
    safe_for_anxiety_fatigue: true,
    target_muscle: 'Diaphragm & Nervous System'
  },
  {
    name: 'Gentle Seated Cat-Cow',
    description: 'Slow rhythmic flexion and extension of the thoracic and lumbar spine seated in a sturdy chair. Mobilizes vertebrae without knee or ankle weight-bearing.',
    video_url: 'https://www.youtube.com/embed/oWExcPBojgA',
    intensity: 'low',
    safe_for_asthma: true,
    safe_for_joint: true,
    safe_for_pcos: true,
    safe_for_postnatal: true,
    safe_for_anxiety_fatigue: true,
    target_muscle: 'Spine & Core'
  },
  {
    name: 'Restorative Supine Pelvic Tilts',
    description: 'Lying flat with knees bent, gently flatten lower back against the mat by engaging deep transverse abdominis without straining pelvic floor or diastasis recti.',
    video_url: 'https://www.youtube.com/embed/jzAJgSA3HqQ',
    intensity: 'low',
    safe_for_asthma: true,
    safe_for_joint: true,
    safe_for_pcos: true,
    safe_for_postnatal: true,
    safe_for_anxiety_fatigue: true,
    target_muscle: 'Pelvic Floor & Transverse Abdominis'
  },
  {
    name: 'Supported Wall Angels',
    description: 'Stand with back flat against a wall. Glide arms up and down in a goalpost motion to open thoracic cage and stabilize scapulae with zero joint impact.',
    video_url: 'https://www.youtube.com/embed/BdEXk-wHyfE',
    intensity: 'low',
    safe_for_asthma: true,
    safe_for_joint: true,
    safe_for_pcos: true,
    safe_for_postnatal: true,
    safe_for_anxiety_fatigue: true,
    target_muscle: 'Upper Back, Posture & Shoulders'
  },
  {
    name: 'Supine Active Hamstring Stretch',
    description: 'Lie on your back and gently extend one leg upwards with a soft towel or strap. Stretches posterior chain without compressing lumbar disc spaces.',
    video_url: 'https://www.youtube.com/embed/q4N8QxQPYDw',
    intensity: 'low',
    safe_for_asthma: true,
    safe_for_joint: true,
    safe_for_pcos: true,
    safe_for_postnatal: true,
    safe_for_anxiety_fatigue: true,
    target_muscle: 'Hamstrings & Lower Back'
  },
  {
    name: 'Guided Progressive Muscle Relaxation',
    description: 'Sequentially tense and relax major muscle groups from toes to neck while maintaining steady diaphragmatic breathing. Lowers somatic cortisol.',
    video_url: 'https://www.youtube.com/embed/1nZEdqcGVzo',
    intensity: 'low',
    safe_for_asthma: true,
    safe_for_joint: true,
    safe_for_pcos: true,
    safe_for_postnatal: true,
    safe_for_anxiety_fatigue: true,
    target_muscle: 'Full Body Relaxation'
  },
  {
    name: 'Pursed-Lip Breathing Technique',
    description: 'Inhale through nose for 2 counts, exhale through pursed lips for 4 counts. Creates positive expiratory pressure to keep bronchial airways open.',
    video_url: 'https://www.youtube.com/embed/7kpJ0QlRss4',
    intensity: 'low',
    safe_for_asthma: true,
    safe_for_joint: true,
    safe_for_pcos: true,
    safe_for_postnatal: true,
    safe_for_anxiety_fatigue: true,
    target_muscle: 'Pulmonary / Respiratory'
  },
  {
    name: 'Seated Resistance Band Rows',
    description: 'Seated tall on chair or mat, loop resistance band around feet and squeeze shoulder blades back. Builds upper body endurance without spinal fatigue.',
    video_url: 'https://www.youtube.com/embed/LSkyinhmA8k',
    intensity: 'moderate',
    safe_for_asthma: true,
    safe_for_joint: true,
    safe_for_pcos: true,
    safe_for_postnatal: true,
    safe_for_anxiety_fatigue: true,
    target_muscle: 'Rhomboids, Lats & Upper Back'
  },
  {
    name: 'Bodyweight Chair Squats',
    description: 'Lower hips back until gently touching chair seat, pause, then push through heels to stand. Minimizes patellofemoral shearing forces.',
    video_url: 'https://www.youtube.com/embed/5Wd4S29E-yE',
    intensity: 'moderate',
    safe_for_asthma: true,
    safe_for_joint: true,
    safe_for_pcos: true,
    safe_for_postnatal: true,
    safe_for_anxiety_fatigue: false,
    target_muscle: 'Quadriceps & Glutes'
  },
  {
    name: 'Beginner Low-Impact Wall Push-Ups',
    description: 'Place hands shoulder-width on wall. Inhale lowering chest towards wall at 45 degree elbow angle, exhale pressing away smoothly.',
    video_url: 'https://www.youtube.com/embed/YWw-3rGaoT0',
    intensity: 'moderate',
    safe_for_asthma: true,
    safe_for_joint: true,
    safe_for_pcos: true,
    safe_for_postnatal: true,
    safe_for_anxiety_fatigue: true,
    target_muscle: 'Chest, Anterior Deltoids & Triceps'
  },
  {
    name: 'Glute Bridges with Isometric Pause',
    description: 'Press heels into mat and elevate pelvis until hips align with shoulders. Squeeze glutes for 3 seconds without overarching lower back.',
    video_url: 'https://www.youtube.com/embed/wPM8icPu6H8',
    intensity: 'moderate',
    safe_for_asthma: true,
    safe_for_joint: true,
    safe_for_pcos: true,
    safe_for_postnatal: true,
    safe_for_anxiety_fatigue: true,
    target_muscle: 'Gluteus Maximus & Hamstrings'
  },
  {
    name: 'Bird-Dog Core Stability',
    description: 'From quadruped position, extend opposite arm and leg parallel to floor. Hold 2 seconds while stabilizing pelvis and maintaining steady nasal breaths.',
    video_url: 'https://www.youtube.com/embed/wiFNA3sqjCA',
    intensity: 'moderate',
    safe_for_asthma: true,
    safe_for_joint: true,
    safe_for_pcos: true,
    safe_for_postnatal: true,
    safe_for_anxiety_fatigue: true,
    target_muscle: 'Core Stabilizers & Posterior Chain'
  },
  {
    name: 'Side-Lying Clamshells',
    description: 'Lie on side with knees bent at 90 degrees. Rotate top knee upward while keeping feet touching. Protects sacroiliac joint and builds hip stability.',
    video_url: 'https://www.youtube.com/embed/39vuP5xozsI',
    intensity: 'low',
    safe_for_asthma: true,
    safe_for_joint: true,
    safe_for_pcos: true,
    safe_for_postnatal: true,
    safe_for_anxiety_fatigue: true,
    target_muscle: 'Gluteus Medius & Hip Rotators'
  },
  {
    name: 'Dead Bug with Neutral Spine',
    description: 'Lie on back with knees at 90 degrees and arms vertical. Lower opposite arm and leg while keeping abdominal wall firmly braced against mat.',
    video_url: 'https://www.youtube.com/embed/g_BYB0R-4Ws',
    intensity: 'moderate',
    safe_for_asthma: true,
    safe_for_joint: true,
    safe_for_pcos: true,
    safe_for_postnatal: true,
    safe_for_anxiety_fatigue: true,
    target_muscle: 'Deep Core & Transverse Abdominis'
  },
  {
    name: 'Standing Calf Raises with Wall Support',
    description: 'Place hands on wall for stability. Elevate onto balls of feet, pause for 1 second, and lower under 3-second control. Improves lower extremity circulation.',
    video_url: 'https://www.youtube.com/embed/gwLzBJYoWlI',
    intensity: 'low',
    safe_for_asthma: true,
    safe_for_joint: true,
    safe_for_pcos: true,
    safe_for_postnatal: true,
    safe_for_anxiety_fatigue: true,
    target_muscle: 'Gastrocnemius & Soleus'
  },
  {
    name: 'Thoracic Thread-the-Needle Stretch',
    description: 'On hands and knees, slide one arm underneath chest allowing shoulder and temple to rest on mat. Gently rotates thoracic spine without neck strain.',
    video_url: 'https://www.youtube.com/embed/gyew25Vaqj8',
    intensity: 'low',
    safe_for_asthma: true,
    safe_for_joint: true,
    safe_for_pcos: true,
    safe_for_postnatal: true,
    safe_for_anxiety_fatigue: true,
    target_muscle: 'Thoracic Spine & Shoulders'
  },
  {
    name: 'Low-Impact Marching in Place',
    description: 'Rhythmic, gentle marching with arm swings. Improves insulin sensitivity and cardiovascular circulation for PCOS and fatigue without cortisol distress.',
    video_url: 'https://www.youtube.com/embed/16oJspYFz7s',
    intensity: 'moderate',
    safe_for_asthma: true,
    safe_for_joint: true,
    safe_for_pcos: true,
    safe_for_postnatal: false,
    safe_for_anxiety_fatigue: true,
    target_muscle: 'Cardiovascular & Lower Body'
  },
  {
    name: 'Restorative Child’s Pose (Balasana)',
    description: 'Kneel with knees apart, hips resting toward heels, and drape torso forward over a bolster. Decompresses lower spine and facilitates abdominal breathing.',
    video_url: 'https://www.youtube.com/embed/2MJGg-dUKh0',
    intensity: 'low',
    safe_for_asthma: true,
    safe_for_joint: true,
    safe_for_pcos: true,
    safe_for_postnatal: true,
    safe_for_anxiety_fatigue: true,
    target_muscle: 'Hips, Lower Back & Pelvis'
  },
  {
    name: 'Standing Lateral Band Walks',
    description: 'Resistance band looped around thighs. Take controlled steps sideways in a quarter-squat position, keeping knees in line with second toes.',
    video_url: 'https://www.youtube.com/embed/6eoK_yxY8Ak',
    intensity: 'moderate',
    safe_for_asthma: true,
    safe_for_joint: true,
    safe_for_pcos: true,
    safe_for_postnatal: true,
    safe_for_anxiety_fatigue: true,
    target_muscle: 'Hip Abductors & Glutes'
  },
  {
    name: 'High Intensity Sprint Intervals (Tabata)',
    description: 'Maximal exertion sprints at near-peak heart rate. (Control exercise: excluded by rule engine for flare, asthma, and joint conditions).',
    video_url: 'https://www.youtube.com/embed/v3hN_-Nun3A',
    intensity: 'high',
    safe_for_asthma: false,
    safe_for_joint: false,
    safe_for_pcos: false,
    safe_for_postnatal: false,
    safe_for_anxiety_fatigue: false,
    target_muscle: 'Cardiovascular & Legs'
  },
  {
    name: 'Heavy Barbell Back Squat',
    description: 'Heavy axial loading squat requiring high lumbar tolerance. (Control exercise: excluded by rule engine for joint and postnatal conditions).',
    video_url: 'https://www.youtube.com/embed/dW3zj79xfrc',
    intensity: 'high',
    safe_for_asthma: false,
    safe_for_joint: false,
    safe_for_pcos: false,
    safe_for_postnatal: false,
    safe_for_anxiety_fatigue: false,
    target_muscle: 'Lower Body & Spine'
  },
  {
    name: 'Plyometric Burpee Tuck Jumps',
    description: 'High impact floor-to-jump explosive transition. (Control exercise: excluded by rule engine for respiratory and joint safety).',
    video_url: 'https://www.youtube.com/embed/TU8QYVW0gDU',
    intensity: 'high',
    safe_for_asthma: false,
    safe_for_joint: false,
    safe_for_pcos: false,
    safe_for_postnatal: false,
    safe_for_anxiety_fatigue: false,
    target_muscle: 'Full Body High Impact'
  }
];

async function seedDatabase() {
  try {
    const sequelize = await initDatabase();
    const models = initModels(sequelize);

    // Synchronize schema
    await sequelize.sync({ alter: false });
    console.log('✓ Database schema synchronized successfully.');

    // Re-seed Exercises with updated verified links
    await models.Exercise.destroy({ where: {} });
    await models.Exercise.bulkCreate(exerciseList);
    console.log(`✓ Seeded ${exerciseList.length} condition-tagged exercises with verified video links.`);

    // Seed Demo User if not exists
    let demoUser = await models.User.findOne({ where: { email: 'demo@fitadapt.com' } });
    if (!demoUser) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash('password123', salt);

      demoUser = await models.User.create({
        name: 'Aanya Sharma',
        email: 'demo@fitadapt.com',
        password_hash
      });

      await models.ConditionProfile.create({
        user_id: demoUser.id,
        condition_type: 'asthma',
        severity: 'mild',
        notes: 'Exercise-induced bronchospasm triggered by cold air or sudden high intensity. Prefers steady warm-up and breathing routines.'
      });

      // Seed 7 days of historical check-ins
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const isFlare = i === 4;
        const checkin = await models.Checkin.create({
          user_id: demoUser.id,
          checkin_date: dateStr,
          energy_level: isFlare ? 2 : (i % 2 === 0 ? 4 : 3),
          pain_level: isFlare ? 4 : 1,
          breathlessness: isFlare ? 3 : 1,
          flare_flag: isFlare
        });

        await models.SessionLog.create({
          user_id: demoUser.id,
          checkin_id: checkin.id,
          exercise_ids: '1,2,4,7',
          completed: true,
          session_date: dateStr
        });
      }

      console.log('✓ Demo user created: demo@fitadapt.com / password123 with 7-day consistency history.');
    } else {
      console.log('✓ Demo user already exists.');
    }

    // Seed Admin User if not exists
    let adminUser = await models.User.findOne({ where: { email: 'admin@fitadapt.com' } });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash('admin123', salt);
      adminUser = await models.User.create({
        name: 'System Admin',
        email: 'admin@fitadapt.com',
        password_hash
      });
      await models.ConditionProfile.create({
        user_id: adminUser.id,
        condition_type: 'other',
        severity: 'mild',
        notes: 'Administrator Account - Full access and calibration privileges'
      });
      console.log('✓ Admin user created: admin@fitadapt.com / admin123');
    } else {
      console.log('✓ Admin user already exists.');
    }

    console.log('✓ Database re-seeding completed successfully.');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (err) {
    console.error('Seeding failed:', err);
    if (require.main === module) {
      process.exit(1);
    }
    throw err;
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, exerciseList };
