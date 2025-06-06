export default function handler(req: any, res: any) {
  res.json({ 
    message: "API is working!", 
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}
