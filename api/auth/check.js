import { isLoggedIn } from '../_lib/session.js';

export default async function handler(req, res) {
  res.status(200).json({ loggedIn: isLoggedIn(req) });
}
