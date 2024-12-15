import { bcryptAdapter, JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "../../domain";

//TODO Existe dependencia directa con UserModel, además de dependencia oculta de Bcrypt falta refactorizar
export class AuthService {
    //* DI
    constructor(
        private readonly jwtAdapter: JwtAdapter,
        // private readonly bcryptAdapter: bcryptAdapter,
        // private readonly userModel: UserModel
    ) {}

    public async registerUser(registerUserDto: RegisterUserDto) {
        const existUser = await UserModel.findOne({email: registerUserDto.email});
        if (existUser) throw CustomError.badRequest('Email already exist');
        try {
            const user = new UserModel(registerUserDto);
            
            // Encriptar la contraseña
            user.password = bcryptAdapter.hash(registerUserDto.password);
            await user.save();
            // JWT para mantener la autenticacion del usuario

            // Email de confirmación

            const {password, ...userEntity} = UserEntity.fromObject(user);
            return {
                user: userEntity,
                token: 'token',
            };
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }

    public async loginUser(loginUserDto: LoginUserDto) {
        const user = await UserModel.findOne({email: loginUserDto.email});
        if (!user) throw CustomError.badRequest('Invalid email or password');

        try {
            const isMatching = bcryptAdapter.compare(loginUserDto.password, user.password);
            if (!isMatching) throw CustomError.badRequest('Invalid email or password');
            const {password, ...userEntity} = UserEntity.fromObject(user);
            const token = await this.jwtAdapter.generateToken({id: user.id});
            if (!token) throw CustomError.internalServer('Error generating token');
            return {
                user: userEntity,
                token: token,
            };
        } catch (error) {
            throw CustomError.internalServer(`${error}`);
        }
    }
}