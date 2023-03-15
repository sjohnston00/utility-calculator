import { faker } from "@faker-js/faker";

describe("smoke tests", () => {
  it("should allow you to register and logout", () => {
    const loginForm = {
      email: `${faker.internet.userName()}@example.com`,
      password: faker.internet.password(),
    };

    cy.then(() => ({ email: loginForm.email })).as("user");

    cy.visitAndCheck("/join");
    cy.findByTestId("email").type(loginForm.email);
    cy.findByTestId("password").type(loginForm.password);
    cy.findByRole("button", { name: /create account/i }).click();
    // cy.findByRole("button", { name: /logout/i }).click();
    // cy.findByRole("link", { name: /log in/i });
  });
});
