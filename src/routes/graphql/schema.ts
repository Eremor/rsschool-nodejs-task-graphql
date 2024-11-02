import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString
} from 'graphql';
import { MemberTypeId } from '../member-types/schemas.js';
import { UUIDType } from './types/uuid.js';

const MemberTypeIdEnum = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: {
      value: MemberTypeId.BASIC
    },
    BUSINESS: {
      value: MemberTypeId.BUSINESS
    }
  }
})

const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: { type: new GraphQLNonNull(MemberTypeIdEnum) },
    discount: { type: new GraphQLNonNull(GraphQLFloat) },
    postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) }
  }
})

const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: {
    id: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) }
  }
})

const CreatePostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) }
  }
})

const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    memberType: { type: new GraphQLNonNull(MemberType) }
  }
})

const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeIdEnum) }
  }
})

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: { type: ProfileType },
    posts: { type: new GraphQLList(new GraphQLNonNull(PostType)) },
    userSubscribedTo: { type: new GraphQLList(new GraphQLNonNull(UserType)) },
    subscribedToUser: { type: new GraphQLList(new GraphQLNonNull(UserType)) }
  })
})

const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) }
  }
})

const RootQueryType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    memberTypes: {
      type: new GraphQLList(new GraphQLNonNull(MemberType)),
      resolve: async (_source, _args, { prisma }) => prisma.memberType.findMany()
    },
    posts: {
      type: new GraphQLList(new GraphQLNonNull(PostType)),
      resolve: async (_source, _args, { prisma }) => prisma.post.findMany()
    },
    users: {
      type: new GraphQLList(new GraphQLNonNull(UserType)),
      resolve: async (_source, _args, { prisma }) => prisma.user.findMany()
    },
    profiles: {
      type: new GraphQLList(new GraphQLNonNull(ProfileType)),
      resolve: async (_source, _args, { prisma }) => prisma.profile.findMany()
    },
    memberType: {
      type: MemberType,
      args: { id: { type: new GraphQLNonNull(UUIDType)} },
      resolve: async (_source, { id }, { prisma }) => prisma.memberType.findUnique({ where: { id } })
    },
    post: {
      type: PostType,
      args: { id: { type: new GraphQLNonNull(UUIDType)} },
      resolve: async (_source, { id }, { prisma }) => prisma.post.findUnique({ where: { id } })
    },
    user: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(UUIDType)} },
      resolve: async (_source, { id }, { prisma }) => prisma.user.findUnique({ where: { id } })
    },
    profile: {
      type: ProfileType,
      args: { id: { type: new GraphQLNonNull(UUIDType)} },
      resolve: async (_source, { id }, { prisma }) => prisma.profile.findUnique({ where: { id } })
    }
  }
})

export const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: null
})