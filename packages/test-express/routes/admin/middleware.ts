export default function adminMiddleware(req: any, res: any, next: any) {
  console.log('Admin middleware');
  next();
}
