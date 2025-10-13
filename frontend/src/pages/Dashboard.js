const Dashboard = () => {
  return (
    <div>
      <h2>📊 Admin Dashboard</h2>
      <p>No games configured yet.</p>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Game</th>
            <th>Category</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="5" style={{ boxDecorationBreak: "clone", textAlign: "center", padding: "20px" }}>
              No games available. Please add games from Game Settings.
            </td>
          </tr>
        </tbody>
      </table>  
    </div>
  );
};


export default Dashboard;