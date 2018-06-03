module.exports.uuIDv4 = (withoutDashes = false) => {
    let uuid = "", i, random;

    for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;

        if (withoutDashes === false)
            if (i == 8 || i == 12 || i == 16 || i == 20)
                uuid += "-"

        uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }

    return uuid;
}

module.exports.matchEmail = (email) => {
    //   \S = conter texto
    //   @ = arroba obrigatória
    //   \S = conter texto
    //   \. = conter ponto
    //   \S = conter texto
    let pattern = /\S+@\S+\.\S+/;

    return email.match(pattern);
}

module.exports.matchPassword = (password) => {
    //   (?=.*\d) = conter dígito
    //   (?=.*[a-z]) = caracteres minúsculos
    //   (?=.*[A-Z]) = caracteres maiúsculos
    //   (?=.*[@#$%]) = caracteres especiais
    //   .{6,20} = tamanho de 6 a 20
    let pattern = /((?=.*\d)(?=.*[a-z]).{6,20})/; // /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{6,20})/;

    return password.match(pattern);
}

module.exports.matchCpf = (cpf) => {
    if ((cpf = cpf.replace(/[^\d]/g, "")).length != 11)
        return false;

    if (cpf == "00000000000" || cpf == "01234567890")
        return false;

    var r;
    var s = 0;

    for (i = 1; i <= 9; i++)
        s = s + parseInt(cpf[i - 1]) * (11 - i);

    r = (s * 10) % 11;

    if ((r == 10) || (r == 11))
        r = 0;

    if (r != parseInt(cpf[9]))
        return false;

    s = 0;

    for (i = 1; i <= 10; i++)
        s = s + parseInt(cpf[i - 1]) * (12 - i);

    r = (s * 10) % 11;

    if ((r == 10) || (r == 11))
        r = 0;

    if (r != parseInt(cpf[10]))
        return false;

    return true;
}

module.exports.removeNonDigits = (target) => {
    return target.replace(/[^\d]/g, "");
}
