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

        if (!user) throw new Error("No user found with this email");
        if (!user.emailVerified) throw new Error("Please verify your email first");
        if (!user.password) throw new Error("User has no password stored");

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) throw new Error("Incorrect password");

        return {
          authenticated: true,
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileImage: user.profileImage,
          emailVerified: user.emailVerified,
          // ✅ Safe optional chaining — won't crash if address is null
          address: {
            street: user.address?.street ?? "",
            city: user.address?.city ?? "",
            state: user.address?.state ?? "",
            zipcode: user.address?.zipcode ?? "",
            country: user.address?.country ?? "",

          },
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, trigger, session, user }) {

      // ✅ When update() is called from client
      if (trigger === "update" && session) {
        token.name = session.name;
        token.phone = session.phone;
        token.profileImage = session.profileImage;
        token.role = session.role;
        token.emailVerified = session.emailVerified;
        // ✅ Store address as nested object in token
        token.address = {
          street: session.address?.street ?? "",
          city: session.address?.city ?? "",
          state: session.address?.state ?? "",
          zipcode: session.address?.zipcode ?? "",
          country: session.address?.country ?? "",
        };
      }

      // ✅ First login — populate token from user returned by authorize
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.phone = user.phone;
        token.profileImage = user.profileImage;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
        // ✅ Nested address object stored in token
        token.address = {
          street: user.address?.street ?? "",
          city: user.address?.city ?? "",
          state: user.address?.state ?? "",
          zipcode: user.address?.zipcode ?? "",
          country: user.address?.country ?? "",
        };
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
        role: token.role,
        emailVerified: token.emailVerified,
        // ✅ Pass the full nested address object — matches what's in the token
        address: {
          street: token.address?.street ?? "",
          city: token.address?.city ?? "",
          state: token.address?.state ?? "",
          zipcode: token.address?.zipcode ?? "",
          country: token.address?.country ?? "",
        },
      };
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as POST, handler as GET };