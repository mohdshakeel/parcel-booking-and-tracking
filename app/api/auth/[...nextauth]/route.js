import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },

async authorize(credentials) {
  await connectDB();

  if (!credentials?.email || !credentials?.password) {
    throw new Error("Email and password are required");
  }

  const { email, password } = credentials;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("No user found with this email");
  }

  if (!user.password) {
    throw new Error("User has no password stored");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error("Incorrect password");
  }

  return {
    authenticated: true,
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone:user.phone,
    role: user.role
  };
}


    }),
  ],

  callbacks: {
    async jwt({ token, user,}) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.profileImage = user.profileImage;
        token.phone = user.phone;
        token.address = user.address;
        token.country = user.country;
        token.state_region = user.state_region;
        token.city = user.city;
        token.zipCode = user.zipCode;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.profileImage = token.profileImage;
      session.user.phone = token.phone;
      session.user.address = token.address;
      session.user.country = token.country;
      session.user.state = token.state;
      session.user.city = token.city;
      session.user.zipCode = token.zipCode;

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  debug: true,
};
const handler = NextAuth(authOptions);
export { handler as POST, handler as GET };