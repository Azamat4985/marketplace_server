export const isAvailable = (req, res) => {
  let server_url = req.get('host');
  let url_split = server_url.split(':');
  res.send({success: true, wsUrl: `ws://${url_split[0]}:3001`})
}