module.exports = (sequelize, DataTypes, bcrypt, crypto) => {
  const User = sequelize.define("user", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    role: {
      type: DataTypes.ENUM("patient", "donor", "bloodBank", "admin"),
      defaultValue: "patient",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        min: 8,
      },
    },

    phone: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bloodGroup: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    province: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    district: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    localLevel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    donatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    availiabilityStatus: {
      // type: DataTypes.ENUM("yes", "no"),
      type: DataTypes.STRING,
      defaultValue: "available",
    },
    parentNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetToken: DataTypes.STRING,
    passwordResetTokenExpiresIn: DataTypes.DATE,
  });

  //runs everytime before saving the data in the database : example in await user.save()
  User.beforeSave(async (user, options) => {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    user.email = user.email.toLowerCase();
  });
  // comparePassword for comparing user provided password and their stored password in the database
  User.prototype.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  //createResetToken generates the 4 digit random otp
  User.prototype.createResetToken = function () {
    const otp = crypto.randomInt(1000, 9999);
    return otp;
  };
  return User;
};
