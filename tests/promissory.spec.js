require('dotenv').config()

const { test} = require('@playwright/test');
test("hubspot login", async ({ browser }) => {
  const context = await browser.newContext({
    storageState: "./auth.json"
  })
  
  //opens HubSpot
  const page = await context.newPage();
  await page.goto("https://www.hubspot.com/");
  await page.waitForTimeout(3000);
  await page.getByRole('link', { name: 'Go to my account' }).click();
  await page.goto('https://app.hubspot.com/contacts/4209490/lists/20314/filters');
 
  //close warning notification
  //await page.getByRole('button', { name: 'Close' }).click();
 
 //srapes data - xPath is unstable, better change it in the future
  const candidateName = await page.locator('//*[@id="crm"]/div[3]/div[1]/div/div/div/div/div/div/section/div/div/main/div/div/div[2]/div/div/div/div[1]/div/div[1]/table/tbody/tr[1]/td[2]/div/a/span/span').textContent();
  const candidateEmail = await page.locator('//*[@id="crm"]/div[3]/div[1]/div/div/div/div/div/div/section/div/div/main/div/div/div[2]/div/div/div/div[1]/div/div[1]/table/tbody/tr[1]/td[4]/a').textContent();
  const guarantorEmail = await page.locator('//*[@id="crm"]/div[3]/div[1]/div/div/div/div/div/div/section/div/div/main/div/div/div[2]/div/div/div/div[1]/div/div[1]/table/tbody/tr[1]/td[5]/span').textContent();
  const guarantorName = await page.locator('//*[@id="crm"]/div[3]/div[1]/div/div/div/div/div/div/section/div/div/main/div/div/div[2]/div/div/div/div[1]/div/div[1]/table/tbody/tr[1]/td[6]/span').textContent();
  const guarantorLastName = await page.locator('//*[@id="crm"]/div[3]/div[1]/div/div/div/div/div/div/section/div/div/main/div/div/div[2]/div/div/div/div[1]/div/div[1]/table/tbody/tr[1]/td[7]/span').textContent();
  
  console.log(
              `CANDIDATE INFO:
              Candidate Name: ${candidateName}\n 
              Candidate Email: ${candidateEmail}\n 
              Guarantor Name: ${guarantorName}\n
              Guarantor Last Name: ${guarantorLastName}\n
              Guarantor Email: ${guarantorEmail}`
  )
  
  //makes sure emails are all in lowercase - add in the future: make sure there are no spaces on the email

  const sanitizedCandidateMail = candidateEmail?.toLowerCase();
  const sanitizedGuarantorMail = guarantorEmail?.toLowerCase();
  if (sanitizedCandidateMail === sanitizedGuarantorMail) {
     return (console.log('ERROR - both mails are the same'))
   }
 
  //open PandaDoc to login
  await page.getByRole('link', {name:`${candidateName}`}).click();
  const page1 = await context.newPage();
  await page1.goto('https://www.pandadoc.com/');
  await page1.getByRole('link', { name: 'Log in' }).click();
  await page1.locator('#email').click();
  await page1.locator('#email').fill('visa@placement-int.com');
  await page1.locator('#password').click();
  await page1.locator('#password').fill('');
  await page1.locator('#password').fill(`${process.env.PANDADOC_PASSWORD}`);
  await page1.getByRole('button', { name: 'Log in' }).click();
  console.log("Succesfully log into PandaDoc 🥳")
  await page1.waitForTimeout(5000);
  await page1.close();
  
  //Go back to HubSpot to create the new document
  await page.getByRole('button', { name: 'Create Document' }).click();
  await page.waitForTimeout(5000);
  await page.frameLocator('internal:role=dialog >> iframe').getByRole('button', { name: 'Accept All Cookies' }).click();
  await page.waitForTimeout(5000);
  await page.frameLocator('internal:role=dialog >> iframe').getByRole('dialog').locator('div').filter({ hasText: 'New Document' }).getByRole('button').click();
  await page.waitForTimeout(3000);
  await page.frameLocator('internal:role=dialog >> iframe').getByPlaceholder('Search').fill('promissory');
  await page.waitForTimeout(3000); 
  await page.frameLocator('internal:role=dialog >> iframe').locator('a').filter({ hasText: 'Promissory Letter Placement International' }).click();
  await page.waitForTimeout(5000);

  //adds info to create the doc
  await page.frameLocator('internal:role=dialog >> iframe').getByPlaceholder('Start typing name or email').first().fill(`${sanitizedGuarantorMail}`);
  await page.frameLocator('internal:role=dialog >> iframe').getByText(`Add ${sanitizedGuarantorMail}`).click();
  await page.frameLocator('internal:role=dialog >> iframe').getByRole('button', { name: 'Add person' }).click();
  await page.waitForTimeout(3000); 
  await page.frameLocator('internal:role=dialog >> iframe').getByPlaceholder('Start typing name or email').first().fill(`${sanitizedCandidateMail}`);
  await page.frameLocator('internal:role=dialog >> iframe').getByText(`${sanitizedCandidateMail}`, { exact: true }).click();
  await page.waitForTimeout(3000);

  const page1Promise = page.waitForEvent('popup');
  await page.frameLocator('internal:role=dialog >> iframe').getByRole('button', { name: 'Start editing' }).click();
  const page2 = await page1Promise;
  await page2.frameLocator('#kolas-editor-iframe').getByRole('button', { name: 'Send' }).click();
  await page2.frameLocator('#kolas-editor-iframe').getByText('Send via email').click();

  //writes email
  await page2.frameLocator('#kolas-editor-iframe').getByTestId('documentNameInput').fill(`Promissory Letter Placement International for ${candidateName}`);
  await page2.frameLocator('#kolas-editor-iframe').getByRole('button', { name: 'Save and continue' }).click();
  await page2.frameLocator('#kolas-editor-iframe').getByPlaceholder('Optional message...').click();
  await page2.frameLocator('#kolas-editor-iframe').getByPlaceholder('Optional message...').fill(`Dear ${guarantorName} ${guarantorLastName}, I hope this email finds you well! Kindly find attached to this email the Promissory Letter of ${candidateName}.
  Please make sure to sign it accordingly and click on finish the document when all the required fields are completed. Thank you! This is an automatic email!`);
  await page2.waitForTimeout(3000);
  await page2.frameLocator('#kolas-editor-iframe').getByRole('button', { name: 'Send document' }).click();
  console.log("Document succesfully sent! ")
  await page2.waitForTimeout(3000);
  await page2.close();
  
  //update candidate on CRM
  await page.getByLabel('test Promissory Letter Bot').fill('Yes');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(3000);
  console.log("Candidate succesfully removed from the list!")
  await page.goto('https://app.hubspot.com/contacts/4209490/lists/20314/filters');
  console.log("Process Completed ✨")
  });