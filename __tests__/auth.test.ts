import { validateUser, validatePetOwner } from "@/lib/auth";

// mock getServerSession
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    pet: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// mock authOptions
jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const mockGetServerSession = getServerSession as jest.Mock;
const mockPetFindUnique = prisma.pet.findUnique as jest.Mock;
const mockUserFindUnique = prisma.user.findUnique as jest.Mock;

// validateUser

describe("validateUser", () => {
  afterEach(() => jest.clearAllMocks());

  test("未登入時回傳 401", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const result = await validateUser();

    expect(result).toEqual({ error: "未登入", status: 401 });
  });

  test("session 存在但沒有 email 時回傳 401", async () => {
    mockGetServerSession.mockResolvedValue({ user: {} });

    const result = await validateUser();

    expect(result).toEqual({ error: "未登入", status: 401 });
  });

  test("登入成功時回傳 email", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { email: "test@example.com" },
    });

    const result = await validateUser();

    expect(result).toEqual({ email: "test@example.com" });
  });
});

// validatePetOwner

describe("validatePetOwner", () => {
  afterEach(() => jest.clearAllMocks());

  test("寵物不存在時回傳 404", async () => {
    mockPetFindUnique.mockResolvedValue(null);

    const result = await validatePetOwner("1", "test@example.com");

    expect(result).toEqual({ error: "寵物不存在", status: 404 });
  });

  test("使用者不存在時回傳 401", async () => {
    mockPetFindUnique.mockResolvedValue({ id: BigInt(1), user_id: BigInt(99) });
    mockUserFindUnique.mockResolvedValue(null);

    const result = await validatePetOwner("1", "test@example.com");

    expect(result).toEqual({ error: "使用者不存在", status: 401 });
  });

  test("寵物不屬於該使用者時回傳 403", async () => {
    mockPetFindUnique.mockResolvedValue({ id: BigInt(1), user_id: BigInt(99) });
    mockUserFindUnique.mockResolvedValue({
      id: BigInt(1),
      email: "test@example.com",
    });

    const result = await validatePetOwner("1", "test@example.com");

    expect(result).toEqual({ error: "無權限", status: 403 });
  });

  test("驗證成功時回傳 pet 和 user", async () => {
    const mockPet = { id: BigInt(1), user_id: BigInt(1) };
    const mockUser = { id: BigInt(1), email: "test@example.com" };

    mockPetFindUnique.mockResolvedValue(mockPet);
    mockUserFindUnique.mockResolvedValue(mockUser);

    const result = await validatePetOwner("1", "test@example.com");

    expect(result).toEqual({ pet: mockPet, user: mockUser });
  });
});
