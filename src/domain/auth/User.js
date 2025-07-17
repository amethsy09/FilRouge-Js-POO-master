export class User {
  constructor({
    id = null,
    email = "",
    password = "",
    name = "",
    roleId = null,
    photo = null,
    localisation = null,
  }) {
    this.id = id;
    this.email = email.trim();
    this.password = password;
    this.name = name.trim();
    this.roleId = roleId;
    this.photo = photo;
    this.localisation = localisation;
  }

  isValid() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      this.name.length >= 2 &&
      emailRegex.test(this.email) &&
      this.password.length >= 6 &&
      this.roleId !== null
    );
  }

  toDto() {
    return {
      id: this.id,
      email: this.email,
      password: this.password,
      name: this.name,
      roleId: this.roleId,
      photo: this.photo,
      localisation: this.localisation,
    };
  }

  static fromDto(dto) {
    return new User(dto);
  }
}
