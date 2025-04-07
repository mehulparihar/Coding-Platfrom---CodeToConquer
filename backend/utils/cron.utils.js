import cron from "node-cron";
import DailyChallenge from "../models/DailyChallenge.model.js";
import User from "../models/user.model.js";
import Problems from "../models/problem.model.js";



cron.schedule('0 0 * * *', async () => {
    try {
      // 1. Get random problem
      const randomProblem = await getRandomProblem();
      
      // 2. Create new daily challenge
      await DailyChallenge.create({
        date: new Date().setHours(0, 0, 0, 0),
        problem: randomProblem._id
      });
  
      // 3. Reset streaks for users who missed yesterday's challenge
      await User.updateMany(
        { 
          isCompletedToday: false,
          lastCompleted: { 
            $lt: new Date(new Date().setDate(new Date().getDate() - 1)) 
          }
        },
        { $set: { currentStreak: 0 } }
      );
  
      // 4. Reset completion flags
      await User.updateMany(
        { isCompletedToday: true },
        { $set: { isCompletedToday: false } }
      );
      console.log("fetch");
    } catch (error) {
      console.error('Daily cron job failed:', error);
    }
  });


  async function getRandomProblem() {
    const count = await Problems.countDocuments();
    const random = Math.floor(Math.random() * count);
    return Problems.findOne().skip(random);
  }

export default cron;