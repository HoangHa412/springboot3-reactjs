package org.example.mycrud.service.Impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

@Service
@Slf4j
public class MailService {

    @Autowired
    private JavaMailSender javaMailSender;

    public static final String EMAIL_HTML_RESET_PASS = "/html/reset-password";

    @Autowired
    private TemplateEngine templateEngine;

    @Value("${spring.mail.from}")
    private String mailFrom;


    public void sendHtmlMail(String from, String[] to, String[] cc, String subject, String textContent) {
        try {
            final MimeMessage message = this.javaMailSender.createMimeMessage();
            final MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(message, "UTF-8");
            mimeMessageHelper.setTo(to);
            mimeMessageHelper.setCc(cc);
            mimeMessageHelper.setFrom(from);
            mimeMessageHelper.setSubject(subject);
            mimeMessageHelper.setText(textContent, true);
            this.javaMailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send: " + e.getMessage(), e);
        }
    }

    public void sendResetPasswordHtmlMail(String[] to, Map<String, String> data, String title) {
        final Context ctx = new Context(LocaleContextHolder.getLocale());
        for (Map.Entry<String, String> entry : data.entrySet()) {
            ctx.setVariable(entry.getKey(), entry.getValue());
        }
        final String textContent = this.templateEngine.process(EMAIL_HTML_RESET_PASS, ctx);

        this.sendHtmlMail(mailFrom, to, new String[]{}, title, textContent);
    }
}
