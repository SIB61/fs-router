export default function admin2Middleware(req: any, res: any, next: any) {
  console.log('Admin2 middleware (using dot notation)');
  next();
}
