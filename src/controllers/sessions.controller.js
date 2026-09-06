export const getSessionsStatus = (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Estructura de sessions disponible"
  });
};