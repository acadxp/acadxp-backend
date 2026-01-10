import { userRepos } from "../infra/repos/user.repo";
jest.mock("../infra/repos/user.repo", () => ({
  userRepos: {
    createUser: jest.fn(),
    storeRefreshToken: jest.fn(),
    getUserById: jest.fn(),
    getUserByEmail: jest.fn(),
  },
}));
import { AuthService } from "./auth.services";

test("Create a valid user", async () => {
  const user = {
    email: "lokoTest@gmail.com",
    password: "Loko@12345",
    name: "Loko Test",
  };

  userRepos.createUser = jest.fn().mockResolvedValue({
    id: "userId123",
    email: user.email,
  });
  const createUser = await AuthService.registerUser(user);
  const { userWithoutPwd } = createUser;

  expect(createUser).toBeDefined();
  expect(createUser).toHaveProperty("userWithoutPwd");
  expect(createUser).toHaveProperty("accessToken");
  expect(createUser).toHaveProperty("refreshToken");

  expect(userWithoutPwd).not.toHaveProperty("password");
});
