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
import { Context, Post, Profile, ResolverArgs, User } from './types/types.js';

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
  fields: () => ({
    id: {
      type: new GraphQLNonNull(MemberTypeIdEnum)
    },
    discount: {
      type: new GraphQLNonNull(GraphQLFloat)
    },
    postsLimitPerMonth: {
      type: new GraphQLNonNull(GraphQLInt)
    }
  })
})

const PostType = new GraphQLObjectType<Post, Context>({
  name: 'Post',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(UUIDType)
    },
    title: {
      type: new GraphQLNonNull(GraphQLString)
    },
    content: {
      type: new GraphQLNonNull(GraphQLString)
    },
    author: {
      type: UserType,
      resolve: async (post, _args, { prisma }) => await prisma.user.findUnique({
        where: { id: post.authorId }
      })
    },
    authorId: {
      type: new GraphQLNonNull(UUIDType)
    }
  })
})

const CreatePostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    title: {
      type: new GraphQLNonNull(GraphQLString)
    },
    content: {
      type: new GraphQLNonNull(GraphQLString)
    },
    authorId: {
      type: new GraphQLNonNull(UUIDType)
    }
  }
})

const ChangePostInput = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    title: {
      type: GraphQLString
    },
    content: {
      type: GraphQLString
    }
  }
})

const ProfileType = new GraphQLObjectType<Profile, Context>({
  name: 'Profile',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(UUIDType)
    },
    isMale: {
      type: new GraphQLNonNull(GraphQLBoolean)
    },
    yearOfBirth: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    memberType: {
      type: MemberType,
      resolve: async (profile, _args, { prisma }) => await prisma.memberType.findUnique({
        where: { id: profile.memberTypeId }
      })
    },
    memberTypeId: {
      type: MemberTypeIdEnum
    }
  })
})

const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    isMale: {
      type: new GraphQLNonNull(GraphQLBoolean)
    },
    yearOfBirth: {
      type: new GraphQLNonNull(GraphQLInt)
    },
    userId: {
      type: new GraphQLNonNull(UUIDType)
    },
    memberTypeId: {
      type: new GraphQLNonNull(MemberTypeIdEnum)
    }
  }
})

const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    isMale: {
      type: GraphQLBoolean
    },
    yearOfBirth: {
      type: GraphQLInt
    },
    memberTypeId: {
      type: MemberTypeIdEnum
    }
  }
})

const UserType = new GraphQLObjectType<User, Context>({
  name: 'User',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(UUIDType)
    },
    name: {
      type: new GraphQLNonNull(GraphQLString)
    },
    balance: {
      type: new GraphQLNonNull(GraphQLFloat)
    },
    profile: {
      type: ProfileType,
      resolve: async (user, _args, { prisma }) => await prisma.profile.findUnique({
        where: { userId: user.id }
      })
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(PostType)),
      resolve: async (user, _args, { prisma }) => await prisma.post.findMany({
        where: { authorId: user.id }
      })
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (user, _args, { prisma }) => await prisma.user.findMany({
        where: {
          subscribedToUser: {
            some: {
              subscriberId: user.id
            }
          }
        }
      })
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async (user, _args, { prisma }) => await prisma.user.findMany({
        where: {
          userSubscribedTo: {
            some: {
              authorId: user.id
            }
          }
        }
      })
    }
  })
})

const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: {
      type: new GraphQLNonNull(GraphQLString)
    },
    balance: {
      type: new GraphQLNonNull(GraphQLFloat)
    }
  }
})

const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: {
      type: GraphQLString
    },
    balance: {
      type: GraphQLFloat
    }
  }
})

const RootQueryType = new GraphQLObjectType<unknown, Context>({
  name: 'RootQueryType',
  fields: () => ({
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
      args: { id: { type: new GraphQLNonNull(MemberTypeIdEnum)} },
      resolve: async (_source, { id }: ResolverArgs<MemberTypeId>, { prisma }) => prisma.memberType.findUnique({ where: { id } })
    },
    post: {
      type: PostType,
      args: { id: { type: new GraphQLNonNull(UUIDType)} },
      resolve: async (_source, { id }: ResolverArgs<string>, { prisma }) => prisma.post.findUnique({ where: { id } })
    },
    user: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(UUIDType)} },
      resolve: async (_source, { id }: ResolverArgs<string>, { prisma }) => prisma.user.findUnique({ where: { id } })
    },
    profile: {
      type: ProfileType,
      args: { id: { type: new GraphQLNonNull(UUIDType)} },
      resolve: async (_source, { id }: ResolverArgs<string>, { prisma }) => prisma.profile.findUnique({ where: { id } })
    }
  })
})

const Mutations = new GraphQLObjectType<unknown, Context>({
  name: 'Mutations',
  fields: {
    createUser: {
      type: UserType,
      args: {
        dto: {
          type: new GraphQLNonNull(CreateUserInput)
        }
      },
      resolve: async (_source, { dto }, { prisma }) => await prisma.user.create({ data: dto })
    },
    deleteUser: {
      type: GraphQLString,
      args: {
        id: {
          type: new GraphQLNonNull(UUIDType)
        }
      },
      resolve: async (_source, { id }, { prisma }) => {
        await prisma.user.delete({
          where: { id }
        })
        return 'User deleted successfully';
      }
    },
    changeUser: {
      type: UserType,
      args: {
        id: {
          type: new GraphQLNonNull(UUIDType)
        },
        dto: {
          type: new GraphQLNonNull(ChangeUserInput)
        }
      },
      resolve: async (_source, { id, dto }, { prisma }) => await prisma.user.update({
        where: { id },
        data: dto
      })
    },
    createProfile: {
      type: ProfileType,
      args: {
        dto: {
          type: new GraphQLNonNull(CreateProfileInput)
        }
      },
      resolve: async (_source, { dto }, { prisma }) => await prisma.profile.create({ data: dto })
    },
    deleteProfile: {
      type: GraphQLString,
      args: {
        id: {
          type: new GraphQLNonNull(UUIDType)
        }
      },
      resolve: async (_source, { id }, { prisma }) => {
        await prisma.profile.delete({
          where: { id }
        })
        return 'Profile deleted successfully';
      }
    },
    changeProfile: {
      type: ProfileType,
      args: {
        id: {
          type: new GraphQLNonNull(UUIDType)
        },
        dto: {
          type: new GraphQLNonNull(ChangeProfileInput)
        }
      },
      resolve: async (_source, { id, dto }, { prisma }) => await prisma.profile.update({
        where: { id },
        data: dto
      })
    },
    createPost: {
      type: PostType,
      args: {
        dto: {
          type: new GraphQLNonNull(CreatePostInput)
        }
      },
      resolve: async (_source, { dto }, { prisma }) => await prisma.post.create({ data: dto })
    },
    deletePost: {
      type: GraphQLString,
      args: {
        id: {
          type: new GraphQLNonNull(UUIDType)
        }
      },
      resolve: async (_source, { id }, { prisma }) => {
        await prisma.post.delete({
          where: { id }
        })
        return 'Post deleted successfully';
      }
    },
    changePost: {
      type: PostType,
      args: {
        id: {
          type: new GraphQLNonNull(UUIDType)
        },
        dto: {
          type: new GraphQLNonNull(ChangePostInput)
        }
      },
      resolve: async (_source, { id, dto }, { prisma }) => await prisma.post.update({
        where: { id },
        data: dto
      })
    },
    subscribeTo: {
      type: GraphQLString,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) }
      },
      resolve: async (_source, { userId, authorId }, { prisma }) => {
        await prisma.user.update({
          where: {
            id: userId
          },
          data: {
            userSubscribedTo: {
              create: {
                authorId
              }
            }
          }
        })
        return 'Subscribed successfully';
      }
    },
    unsubscribeFrom: {
      type: GraphQLString,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) }
      },
      resolve: async (_source, { userId, authorId }, { prisma }) => {
        await prisma.user.update({
          where: {
            id: userId
          },
          data: {
            userSubscribedTo: {
              deleteMany: {
                authorId
              }
            }
          }
        })
        return 'Unsubscribed successfully';
      }
    }
  }
})

export const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: Mutations
})