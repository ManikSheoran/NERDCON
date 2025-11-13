const Team = require('../models/Team.js');
const Hint = require('../models/Hint.js');

const getTeamsData = async (req, res) => {
  try {
    // Fetch all teams with their game state
    const teams = await Team.find({})
      .sort({ 
        'gameState.completedHints': -1, 
        'gameState.penalties': 1,
        'gameState.lastHintSubmittedAt': 1
      })
      .lean();

    // Fetch all hints to build hint completion array
    const hints = await Hint.find({}).sort({ hint_id: 1 }).lean();

    const teamsData = teams.map(team => {
      const completedHintIds = team.gameState?.completedHints || [];
      
      // Create array of 1s and 0s for each hint (1 = completed, 0 = not completed)
      const hintCompletionStatus = hints.map(hint => 
        completedHintIds.includes(hint.hint_id) ? 1 : 0
      );

      return {
        name: team.name,
        currentHintId: team.gameState?.currentHintId || 1,
        hintsCompleted: completedHintIds.length,
        penalties: team.gameState?.penalties || 0,
        hintCompletion: hintCompletionStatus,
        lastSubmission: team.gameState?.lastHintSubmittedAt 
          ? new Date(team.gameState.lastHintSubmittedAt).toLocaleString()
          : null,
      };
    });

    res.json({ teams: teamsData, totalHints: hints.length });
  } catch (error) {
    console.error('Fetch teams error:', error);
    res.status(500).json({ message: 'Failed to fetch teams', error: error.message });
  }
};

const getTeamsCSV = async (req, res) => {
  try {
    // Fetch all teams with their game state
    const teams = await Team.find({})
      .sort({ 
        'gameState.completedHints': -1, 
        'gameState.penalties': 1,
        'gameState.lastHintSubmittedAt': 1
      })
      .lean();

    // Fetch all hints to get hint names
    const hints = await Hint.find({}).sort({ hint_id: 1 }).lean();

    // Create CSV header
    const hintColumns = hints.map((h, i) => `Hint ${i + 1}`);
    const csvHeader = [
      'Team Name',
      'Current Hint',
      'Hints Completed',
      'Penalties',
      'Last Submission',
      ...hintColumns
    ].join(',');

    // Create CSV rows
    const csvRows = teams.map(team => {
      const completedHintIds = team.gameState?.completedHints || [];
      
      // Mark which hints are completed (1 = completed, 0 = not completed)
      const hintStatus = hints.map(hint => 
        completedHintIds.includes(hint.hint_id) ? '1' : '0'
      );

      return [
        `"${team.name}"`,
        team.gameState?.currentHintId || 1,
        completedHintIds.length,
        team.gameState?.penalties || 0,
        team.gameState?.lastHintSubmittedAt 
          ? new Date(team.gameState.lastHintSubmittedAt).toLocaleTimeString('en-IN', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })
          : 'N/A',
        ...hintStatus
      ].join(',');
    });

    // Combine header and rows
    const csv = [csvHeader, ...csvRows].join('\n');

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=teams_progress_${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ message: 'Failed to generate CSV', error: error.message });
  }
};

module.exports = { getTeamsCSV, getTeamsData };
