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

  // BLOCK LOGIN IF NOT VERIFIED
        if (!user.emailVerified) {
          throw new Error("Please verify your email first");
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
    role: user.role,
    profileImage: user.profileImage,
    address: user.address,
    country: user.country,
    state_region: user.state_region,
    city: user.city,
   zipCode: user.zipCode,
   emailVerified: user.emailVerified,
  };
}


    }),
  ],

 callbacks: {
  async jwt({ token, trigger, session, user }) {

    // when update() is called
    if (trigger === "update" && session) {
      token.name = session.name;
      token.phone = session.phone;
      token.profileImage = session.profileImage;
      token.address = session.address;
      token.country = session.country;
      token.state_region = session.state_region;
      token.city = session.city;
      token.zipCode = session.zipCode;
      token.role = session.role;
      token.emailVerified = session.emailVerified;
    }

    // first login
    if (user) {
      token.id = user.id;
      token.name = user.name;
      token.phone = user.phone;
      token.profileImage = user.profileImage;
      token.address = user.address;
      token.country = user.country;
      token.state_region = user.state_region;
      token.city = user.city;
      token.zipCode = user.zipCode;
      token.role = user.role;
      token.emailVerified = user.emailVerified;
    }

    return token;
  },

  async session({ session, token }) {
    session.user = {
      ...session.user,
      id: token.id,
      name: token.name,
      phone: token.phone,
      profileImage: token.profileImage,
      address: token.address,
      country: token.country,
      state_region: token.state_region,
      city: token.city,
      zipCode: token.zipCode,
      role: token.role,
      emailVerified: token.emailVerified,
    };
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