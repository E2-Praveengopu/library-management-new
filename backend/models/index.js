
import User from "./User.js";
import Book from "./Book.js";
import Loan from "./Loan.js";

export {User,Book,Loan};

User.hasMany(Loan,{foreignKey:'memberId',as:'loans'});
Loan.belongsTo(User,{foreignKey:'memberId',as:'member'});


User.hasMany(Loan,{foreignKey:'issuedById',as:'issuedLoans'});
Loan.belongsTo(User,{foreignKey:'issuedById',as:'issuedLoans'});


Book.hasMany(Loan, { foreignKey: 'bookId', as: 'loans' });
Loan.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

