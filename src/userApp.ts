import { IUser, IUserRepository, IUserApp, User } from 'ptz-user-domain';
import { hash, compare } from 'bcryptjs';
import { encode, decode } from 'jwt-simple';

function UserApp(userRepository: IUserRepository): IUserApp {
    var tokenSecret, passwordSalt;
    passwordSalt = tokenSecret = process.env.PASSWORD_SALT;

    async function hashPassword(user: IUser): Promise<IUser> {
        if (!user.password)
            return Promise.resolve(user);

        if (!passwordSalt)
            throw 'passwordSalt not added to process.env.';

        user.passwordHash = await hash(user.password, passwordSalt);
        user.password = undefined;

        return Promise.resolve(user);
    }

    async function save(user: IUser): Promise<IUser> {
        user = new User(user);

        user = await hashPassword(user);

        if (!user.isValid())
            return Promise.resolve(user);

        var otherUsers = await userRepository.getOtherUsersWithSameUserNameOrEmail(user);

        if (user.otherUsersWithSameUserNameOrEmail(otherUsers))
            return Promise.resolve(user);

        var usersFromDb: IUser[] = (await userRepository.getByIds([user.id]));

        if (usersFromDb && usersFromDb.length > 0) {
            var userDb = new User(usersFromDb[0]);
            user = userDb.update(user);
        }

        user = await userRepository.save(user);

        return Promise.resolve(user);
    }

    function find(query, { limit }) {
        return userRepository.find(query, { limit });
    }

    async function authenticateUser(userNameOrEmail: string
        , password: string): Promise<IUser> {
        var user = await userRepository.getByUserNameOrEmail(userNameOrEmail);

        var userError = User.getUserAthenticationError(userNameOrEmail);

        if (!user)
            return Promise.resolve(userError);

        var res = await compare(password, user.passwordHash);

        if (res)
            return Promise.resolve(user);
        else
            return Promise.resolve(userError);
    }

    async function getAuthToken(userNameOrEmail: string, password: string)
        : Promise<IUser> {
        var user = await authenticateUser(userNameOrEmail, password);

        if (user.isValid())
            user.accessToken = encode(user, tokenSecret);

        return Promise.resolve(user);
    }

    function verifyAuthToken(token: string): Promise<User> {
        var user = decode(token, passwordSalt);
        return Promise.resolve(user);
    }

    return {
        save,
        find,
        getAuthToken,
        verifyAuthToken,
        hashPassword,
        authenticateUser
    }
}

export default UserApp;
